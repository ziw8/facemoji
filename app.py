from io import BytesIO

import numpy as np
from flask import Flask, jsonify, request, send_from_directory
from PIL import Image, ImageOps

try:
    import face_recognition

    FACE_RECOGNITION_ERROR = None
except Exception as exc:  # pragma: no cover - exercised only when dependency is missing
    face_recognition = None
    FACE_RECOGNITION_ERROR = str(exc)


app = Flask(__name__, static_folder=".", static_url_path="")


def _face_area(location):
    top, right, bottom, left = location
    return max(right - left, 0) * max(bottom - top, 0)


def _face_iou(first, second):
    first_top, first_right, first_bottom, first_left = first
    second_top, second_right, second_bottom, second_left = second

    inter_left = max(first_left, second_left)
    inter_top = max(first_top, second_top)
    inter_right = min(first_right, second_right)
    inter_bottom = min(first_bottom, second_bottom)
    inter_area = max(inter_right - inter_left, 0) * max(inter_bottom - inter_top, 0)
    union_area = _face_area(first) + _face_area(second) - inter_area

    if union_area == 0:
        return 0

    return inter_area / union_area


def _merge_face_locations(*location_groups):
    merged = []

    for locations in location_groups:
        for location in locations:
            if any(_face_iou(location, existing) > 0.35 for existing in merged):
                continue

            merged.append(location)

    return merged


@app.get("/")
def index():
    return send_from_directory(".", "index.html")


@app.get("/api/health")
def health():
    return jsonify(
        {
            "face_recognition_available": face_recognition is not None,
            "error": FACE_RECOGNITION_ERROR,
        }
    )


@app.post("/api/detect-faces")
def detect_faces():
    if face_recognition is None:
        return (
            jsonify(
                {
                    "error": (
                        "face_recognition 라이브러리가 설치되어 있지 않습니다. "
                        "requirements.txt 설치 후 서버를 다시 실행하세요."
                    ),
                    "detail": FACE_RECOGNITION_ERROR,
                }
            ),
            503,
        )

    image_file = request.files.get("image")
    if image_file is None:
        return jsonify({"error": "이미지 파일이 전달되지 않았습니다."}), 400

    try:
        image = Image.open(BytesIO(image_file.read()))
        image = ImageOps.exif_transpose(image).convert("RGB")
    except Exception:
        return jsonify({"error": "이미지를 읽을 수 없습니다."}), 400

    original_width, original_height = image.size
    max_side = 1600
    detection_scale = min(max_side / max(original_width, original_height), 1)

    if detection_scale < 1:
        detection_size = (
            round(original_width * detection_scale),
            round(original_height * detection_scale),
        )
        detection_image = image.resize(detection_size, Image.Resampling.LANCZOS)
    else:
        detection_image = image

    image_array = np.asarray(detection_image)
    locations = face_recognition.face_locations(
        image_array,
        number_of_times_to_upsample=1,
        model="hog",
    )
    detail_locations = face_recognition.face_locations(
        image_array,
        number_of_times_to_upsample=2,
        model="hog",
    )
    locations = _merge_face_locations(locations, detail_locations)
    scale_back = 1 / detection_scale

    faces = []
    for index, (top, right, bottom, left) in enumerate(locations):
        faces.append(
            {
                "id": index,
                "top": round(top * scale_back),
                "right": round(right * scale_back),
                "bottom": round(bottom * scale_back),
                "left": round(left * scale_back),
            }
        )

    faces.sort(key=lambda face: (face["top"], face["left"]))
    for index, face in enumerate(faces):
        face["id"] = index

    return jsonify(
        {
            "width": original_width,
            "height": original_height,
            "faces": faces,
        }
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=True)
