import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseFollowup } from './case-followup';

describe('CaseFollowup', () => {
  let component: CaseFollowup;
  let fixture: ComponentFixture<CaseFollowup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseFollowup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseFollowup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
