import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordDialog } from './reset-password-dialog';

describe('ResetPasswordDialog', () => {
  let component: ResetPasswordDialog;
  let fixture: ComponentFixture<ResetPasswordDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
