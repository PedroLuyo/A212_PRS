import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaMenuPlatosComponent } from './vista-menu-platos.component';

describe('VistaMenuPlatosComponent', () => {
  let component: VistaMenuPlatosComponent;
  let fixture: ComponentFixture<VistaMenuPlatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VistaMenuPlatosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VistaMenuPlatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
