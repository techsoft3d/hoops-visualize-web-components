import { html } from 'lit';
import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest';

import { renderTemplate } from '../testing/utils';
import './context-manager';
import {
  DrawMode,
  MarkupManager,
  Projection,
  View,
  WebViewer,
  Operators,
  OperatorManager,
  OperatorId,
} from '@ts3d-hoops/web-viewer';

// Mock getService from ../services
vi.mock('../services', () => ({
  getService: vi.fn(() => ({
    reset: vi.fn(),
  })),
}));

describe('hoops-web-viewer-context-manager', () => {
  const mockOperatorManager = {
    get: vi.fn(),
    set: vi.fn(),
    getOperator: vi.fn((id: number) => {
      if (id === OperatorId.WalkMode) {
        return {
          walkOperator: {},
          keyboardWalkOperator: {},
        };
      }
      return null;
    }),
  } as unknown as OperatorManager;

  const mockView = {
    getDrawMode: vi.fn(() => DrawMode.Shaded),
    setDrawMode: vi.fn(),
    getProjectionMode: vi.fn(() => Projection.Perspective),
    setProjectionMode: vi.fn(),

    operatorManager: mockOperatorManager,
  } as unknown as View;

  const mockMarkupManager = {} as unknown as MarkupManager;
  const mockNoteText = {
    remove: vi.fn(),
    restore: vi.fn(),
    uniqueId: 'mock-note-text',
    getText: vi.fn(() => 'Mock Note Text'),
    getClassName: vi.fn(() => 'NoteText'),
  } as unknown as Operators.Markup.Note.NoteText;
  const mockNoteTextManager = {
    getNoteTextList: vi.fn(() => [mockNoteText]),
    setIsolateActive: vi.fn(),
    updatePinVisibility: vi.fn(),
  } as unknown as Operators.NoteTextManager;

  const mockWebViewer = {
    setCallbacks: vi.fn(),
    unsetCallbacks: vi.fn(),
    reset: vi.fn().mockResolvedValue(undefined),
    sheetManager: { isDrawingSheetActive: vi.fn(() => false) },
    view: mockView,
    markupManager: mockMarkupManager,
    noteTextManager: mockNoteTextManager,
    getSceneReady: vi.fn(() => true),
  } as unknown as WebViewer;

  beforeAll(() => {
    (mockNoteTextManager as any).viewer = mockWebViewer;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('hwv', mockWebViewer);
    (mockMarkupManager as any).viewer = mockWebViewer;
  });

  it('should render the context manager', async () => {
    await renderTemplate(
      html` <hoops-web-viewer-context-manager></hoops-web-viewer-context-manager>`,
    );
    const contextManager: HTMLElement = document.querySelector('hoops-web-viewer-context-manager')!;
    expect(contextManager).toBeTruthy();
  });

  it('should render the context manager with a child element', async () => {
    await renderTemplate(
      html` <hoops-web-viewer-context-manager>
        <div>Test Slot Content</div>
      </hoops-web-viewer-context-manager>`,
    );
    const contextManager: HTMLElement = document.querySelector('hoops-web-viewer-context-manager')!;
    expect(contextManager).toBeTruthy();

    const child = contextManager.querySelector('div');
    expect(child).toBeTruthy();
    expect(child!.textContent).toBe('Test Slot Content');
  });

  it('should set the webViewer and call setCallbacks', async () => {
    const contextManager: HTMLElement = document.querySelector('hoops-web-viewer-context-manager')!;
    const instance = contextManager as any;

    instance.webViewer = mockWebViewer;

    expect(instance._webViewer).toBe(mockWebViewer);
    expect(instance.webViewer).toBe(mockWebViewer);

    instance.webViewer = undefined;

    expect(instance._webViewer).toBeUndefined();
    expect(instance.webViewer).toBeUndefined();
  });

  it('should call getDrawMode from the view', async () => {
    const contextManager: HTMLElement = document.querySelector('hoops-web-viewer-context-manager')!;
    const instance = contextManager as any;

    instance.webViewer = mockWebViewer;

    expect(mockView.getDrawMode).toHaveBeenCalled();
    expect(instance.webviewerState.drawMode).toBe(DrawMode.Shaded);
  });

  it('should set the draw mode and projection mode', async () => {
    const contextManager: HTMLElement = document.querySelector('hoops-web-viewer-context-manager')!;
    const instance = contextManager as any;

    instance.webViewer = mockWebViewer;

    instance.setDrawMode(DrawMode.Wireframe);

    expect(mockView.setDrawMode).toHaveBeenCalledWith(DrawMode.Wireframe);
    expect(instance.webviewerState.drawMode).toBe(DrawMode.Wireframe);
  });

  it('should reset properly', async () => {
    const contextManager: HTMLElement = document.querySelector('hoops-web-viewer-context-manager')!;
    const instance = contextManager as any;

    (mockWebViewer.reset as ReturnType<typeof vi.fn>).mockClear();
    instance.webViewer = undefined;
    await instance.reset();
    expect(mockWebViewer.reset).not.toHaveBeenCalled();

    (mockWebViewer.reset as ReturnType<typeof vi.fn>).mockClear();
    instance.webViewer = mockWebViewer;

    await instance.reset();

    expect(mockWebViewer.reset).toHaveBeenCalled();
    expect(mockWebViewer.sheetManager.isDrawingSheetActive).toHaveBeenCalled();
    expect(mockWebViewer.noteTextManager.setIsolateActive).toHaveBeenCalled();
    expect(mockWebViewer.noteTextManager.updatePinVisibility).toHaveBeenCalled();
    expect(mockOperatorManager.getOperator).toHaveBeenCalledWith(OperatorId.Handle);

    (mockWebViewer.reset as ReturnType<typeof vi.fn>).mockClear();
    mockWebViewer.sheetManager.isDrawingSheetActive = vi.fn(() => true);
    (mockWebViewer.noteTextManager.setIsolateActive as ReturnType<typeof vi.fn>).mockClear();
    (mockWebViewer.noteTextManager.updatePinVisibility as ReturnType<typeof vi.fn>).mockClear();
    (mockOperatorManager.getOperator as ReturnType<typeof vi.fn>).mockClear();

    await instance.reset();
    expect(mockWebViewer.reset).toHaveBeenCalled();
    expect(mockWebViewer.sheetManager.isDrawingSheetActive).toHaveBeenCalled();
    expect(mockWebViewer.noteTextManager.setIsolateActive).not.toHaveBeenCalled();
    expect(mockWebViewer.noteTextManager.updatePinVisibility).not.toHaveBeenCalled();
    expect(mockOperatorManager.getOperator).not.toHaveBeenCalled();

    (mockWebViewer.reset as ReturnType<typeof vi.fn>).mockClear();
    mockWebViewer.sheetManager.isDrawingSheetActive = vi.fn(() => false);
    (mockWebViewer.noteTextManager.setIsolateActive as ReturnType<typeof vi.fn>).mockClear();
    (mockWebViewer.noteTextManager.updatePinVisibility as ReturnType<typeof vi.fn>).mockClear();

    const mockHandleOperator = {
      removeHandles: vi.fn(),
    } as unknown as Operators.HandleOperator;
    (mockOperatorManager.getOperator as any) = vi.fn(() => mockHandleOperator);

    await instance.reset();
    expect(mockWebViewer.reset).toHaveBeenCalled();
    expect(mockWebViewer.sheetManager.isDrawingSheetActive).toHaveBeenCalled();
    expect(mockWebViewer.noteTextManager.setIsolateActive).toHaveBeenCalled();
    expect(mockWebViewer.noteTextManager.updatePinVisibility).toHaveBeenCalled();
    expect(mockOperatorManager.getOperator).toHaveBeenCalledWith(OperatorId.Handle);
    expect(mockHandleOperator.removeHandles).toHaveBeenCalled();
  });

  it('should manage operators', async () => {
    const contextManager: HTMLElement = document.querySelector('hoops-web-viewer-context-manager')!;
    const instance = contextManager as any;

    instance.webViewer = mockWebViewer;
    const consoleError = vi.spyOn(console, 'error');
    instance.setRedlineOperator(OperatorId.Invalid);
    expect(consoleError).toHaveBeenCalledWith('Invalid redline operator ID:', OperatorId.Invalid);

    consoleError.mockClear();
    instance.setRedlineOperator(OperatorId.RedlineCircle);
    mockOperatorManager.get = vi.fn(() => OperatorId.RedlineCircle);
    expect(instance.activeToolOperator).toBe(OperatorId.RedlineCircle);
    expect(instance.isRedlineOperatorActive()).toBe(true);

    mockOperatorManager.get = vi.fn(() => OperatorId.Handle);
    expect(instance.isRedlineOperatorActive()).toBe(false);

    instance.webViewer = undefined;
    expect(instance.isRedlineOperatorActive()).toBe(false);
    expect(instance.activeToolOperator).toBeUndefined();

    consoleError.mockClear();
    instance.activeToolOperator = OperatorId.Handle;
    expect(consoleError).toHaveBeenCalledWith('Cannot set operator: WebViewer not initialized');

    instance.webViewer = mockWebViewer;
    instance.activeToolOperator = OperatorId.Handle;
    expect(instance.activeToolOperator).toBe(OperatorId.Handle);

    instance.webViewer = mockWebViewer;
    mockOperatorManager.get = vi.fn(() => OperatorId.Invalid);
    expect(instance.activeToolOperator).toBeUndefined();

    mockOperatorManager.get = vi.fn(() => OperatorId.None);
    expect(instance.activeToolOperator).toBeUndefined();

    (mockOperatorManager.set as ReturnType<typeof vi.fn>).mockClear();
    instance.activeToolOperator = undefined;
    expect(mockOperatorManager.set).toHaveBeenCalledWith(OperatorId.None, 1);
  });
});
