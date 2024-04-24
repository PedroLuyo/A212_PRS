import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComensalComponent } from './comensal.component';

describe('ComensalComponent', () => {
  let component: ComensalComponent;
  let fixture: ComponentFixture<ComensalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComensalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComensalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
