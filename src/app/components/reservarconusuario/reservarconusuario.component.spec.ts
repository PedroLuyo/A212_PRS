import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarconusuarioComponent } from './reservarconusuario.component';

describe('ReservarconusuarioComponent', () => {
  let component: ReservarconusuarioComponent;
  let fixture: ComponentFixture<ReservarconusuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservarconusuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReservarconusuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
