import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasusuariosComponent } from './reservasusuarios.component';

describe('ReservasusuariosComponent', () => {
  let component: ReservasusuariosComponent;
  let fixture: ComponentFixture<ReservasusuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservasusuariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReservasusuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
