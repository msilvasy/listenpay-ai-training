import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentRow } from './content-row.component';
import { LearningModule } from '../../portal.models';

describe('ContentRow', () => {
  let component: ContentRow;
  let fixture: ComponentFixture<ContentRow>;

  const mockItem: LearningModule = {
    id: 'test-001',
    category: 'health',
    title: 'Test Module',
    publishedAt: '1/1/2026',
    state: 'not-started',
    statusLabel: 'Not started',
    rewardAmount: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentRow],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentRow);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', mockItem);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
