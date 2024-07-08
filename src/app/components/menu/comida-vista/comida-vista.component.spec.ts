import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComidaVistaComponent } from './comida-vista.component';

describe('ComidaVistaComponent', () => {
  let component: ComidaVistaComponent;
  let fixture: ComponentFixture<ComidaVistaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComidaVistaComponent]
    });
    fixture = TestBed.createComponent(ComidaVistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
