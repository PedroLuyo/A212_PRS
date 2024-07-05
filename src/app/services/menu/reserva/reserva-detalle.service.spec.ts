import { TestBed } from '@angular/core/testing';

import { ReservaDetalleService } from './reserva-detalle.service';

describe('ReservaDetalleService', () => {
  let service: ReservaDetalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservaDetalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
