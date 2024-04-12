import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatocartaComponent } from './platocarta.component';

describe('PlatocartaComponent', () => {
  let component: PlatocartaComponent;
  let fixture: ComponentFixture<PlatocartaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlatocartaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlatocartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
