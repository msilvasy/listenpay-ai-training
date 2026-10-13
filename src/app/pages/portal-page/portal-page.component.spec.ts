import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PortalPage } from './portal-page.component';

describe('PortalPage', () => {
  let component: PortalPage;
  let fixture: ComponentFixture<PortalPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortalPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PortalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
