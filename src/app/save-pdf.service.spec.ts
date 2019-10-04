import { TestBed } from '@angular/core/testing';

import { SavePdfService } from './save-pdf.service';

describe('SavePdfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SavePdfService = TestBed.get(SavePdfService);
    expect(service).toBeTruthy();
  });
});
