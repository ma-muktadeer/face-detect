import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceDetect } from './face-detect';

describe('FaceDetect', () => {
  let component: FaceDetect;
  let fixture: ComponentFixture<FaceDetect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceDetect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceDetect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
