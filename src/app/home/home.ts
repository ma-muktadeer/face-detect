import { Component, ElementRef, Inject, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as mpFaceDetection from '@mediapipe/face_detection';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElementRef!: ElementRef<HTMLCanvasElement>;

  private detector: faceDetection.FaceDetector | null = null;
  private animationFrameId: number = 0;
  status = signal<string>('Loading model...');
  isBrowser = signal<boolean>(false);
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser.update(() => isPlatformBrowser(this.platformId));
  }
  ngAfterViewInit(): void {
    if (this.isBrowser()) {
      this.setupCamera();
    } else {
      this.status.update(() => 'Webcam features not available in server-side rendering environment.');
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser()) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      if (this.videoElementRef && this.videoElementRef.nativeElement.srcObject) {
        (this.videoElementRef.nativeElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    }
  }

  async setupCamera(): Promise<void> {
    if (!this.isBrowser()) {
      this.status.update(() => 'Cannot access webcam outside of browser environment.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = this.videoElementRef.nativeElement;
      video.srcObject = stream;
      await video.play();
      this.status.update(() => 'Camera started. Loading detection model...');
      this.loadModel();
    } catch (error) {
      console.error('Error accessing webcam:', error);
      this.status.update(() => 'Error: Could not access webcam. Please allow camera access.');
    }
  }

  async loadModel(): Promise<void> {
    // You can choose different models: 'short', 'full', 'heavy'
    // 'full' provides a good balance for general use
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig: faceDetection.MediaPipeFaceDetectorMediaPipeModelConfig = {
      runtime: 'mediapipe', // or 'tfjs'
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@${mpFaceDetection.VERSION}` // Required for 'mediapipe' runtime
    };

    try {
      // this.detector = await faceDetection.createDetector(model);
      this.detector = await faceDetection.createDetector(model, detectorConfig);
      this.status.update(() => 'Model loaded. Detecting faces...');
      this.detectFaces();
    } catch (error) {
      console.error('Error loading face detection model:', error);
      this.status.update(() => 'Error: Could not load face detection model.');
    }
  }

  async detectFaces(): Promise<void> {
    const video = this.videoElementRef.nativeElement;
    const canvas = this.canvasElementRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context || !this.detector) {
      this.animationFrameId = requestAnimationFrame(() => this.detectFaces());
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const faces = await this.detector.estimateFaces(video);

      // Draw bounding boxes and landmarks
      faces.forEach(face => {
        const box = face.box;
        const keypoints = face.keypoints;

        // Draw bounding box
        context.strokeStyle = 'lime';
        context.lineWidth = 2;
        context.strokeRect(box.xMin, box.yMin, box.width, box.height);

        // Draw keypoints (optional)
        if (keypoints) {
          context.fillStyle = 'red';
          keypoints.forEach(keypoint => {
            context.beginPath();
            context.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
            context.fill();
          });
        }
      });
    }

    this.animationFrameId = requestAnimationFrame(() => this.detectFaces());
  }
}
