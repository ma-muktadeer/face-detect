import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
// import * as faceapi from '@vladmandic/face-api';
// import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js';
// Force browser environment manually

@Component({
  selector: 'app-face-detect',
  imports: [],
  templateUrl: './face-detect.html',
  styleUrl: './face-detect.scss'
})
export class FaceDetect implements AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  faceapi: typeof import('@vladmandic/face-api/dist/face-api.esm.js');
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      this.faceapi = await import ('@vladmandic/face-api');
      // this.faceapi = await import('@vladmandic/face-api/dist/face-api.esm.js');
      await this.loadModels();
      this.startVideo();
    }
  }
  startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.videoRef.nativeElement.srcObject = stream;
        this.videoRef.nativeElement.onplay = () => this.detectFace();
      })
  }
  async detectFace() {
    debugger
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const displaySize = { width: video.width, height: video.height };

    this.faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await this.faceapi
        .detectAllFaces(video, new this.faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      const resized = this.faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      this.faceapi.draw.drawDetections(canvas, resized);
      this.faceapi.draw.drawFaceLandmarks(canvas, resized);
      this.faceapi.draw.drawFaceExpressions(canvas, resized);

      resized.forEach(det => {
        console.log('det', det);

        // draw face expressions, ensuring type compatibility
  // this.faceapi.draw.drawFaceExpressions(canvas, [det] as DrawFaceExpressionsInput[]);

        const { age, gender, genderProbability } = det;
        const text = `${gender} (${Math.round(genderProbability * 100)}%) | Age: ${Math.round(age)}`;

        const drawTextField = new this.faceapi.draw.DrawTextField(
          [text],
          det.detection.box.bottomRight,
          {}  // optional draw options
        );

        drawTextField.draw(canvas.getContext('2d'));
      });
    }, 100);
  }

  async loadModels() {
    const modelPath = '../../assets/models';
    await Promise.all([
      this.faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
      this.faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
      this.faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
      this.faceapi.nets.ageGenderNet.loadFromUri(modelPath),
      this.faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
    ]);
  }

}
