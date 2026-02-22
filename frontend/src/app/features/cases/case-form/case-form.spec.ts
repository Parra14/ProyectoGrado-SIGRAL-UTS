import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseForm } from './case-form';

describe('CaseForm', () => {
  let component: CaseForm;
  let fixture: ComponentFixture<CaseForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
