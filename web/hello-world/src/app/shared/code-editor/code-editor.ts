import {
  Component,
  Input,
  HostBinding,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorState, Compartment, Extension } from '@codemirror/state';
import {
  EditorView,
  keymap,
  placeholder as placeholderExt,
  lineNumbers,
  highlightActiveLineGutter,
  highlightActiveLine,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching } from '@codemirror/language';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  template: `<div class="code-editor-container"
    [class.theme-dark]="theme === 'dark'"
    [class.theme-light]="theme === 'light'"
    [class.border-enabled]="border"
    [class.readonly-mode]="readonly"
    [style.height]="height || (rows ? 'auto' : '100%')"
    [style.border-color]="borderColor">
    <div #editorHost class="code-input"></div>
  </div>`,
  styleUrl: './code-editor.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CodeEditor, multi: true }],
})
export class CodeEditor implements ControlValueAccessor, AfterViewInit, OnDestroy, OnChanges {
  @HostBinding('style.display') readonly display = 'block';
  @HostBinding('style.width') readonly width = '100%';
  @HostBinding('style.height') get hostHeight(): string {
    if (this.height) return this.height;
    if (this.rows) return 'auto';
    return '100%';
  }

  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;

  @Input() rows?: number;
  @Input() height = '';
  @Input() resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'none';
  @Input() fontSize = '14px';
  @Input() lineHeight: string | number = 1.7;
  @Input() padding = '20px';
  @Input() theme: 'dark' | 'light' = 'dark';
  @Input() border = false;
  @Input() borderColor = '#343a40';
  @Input() readonly = false;
  @Input() placeholder = '';
  @Input() language: 'javascript' | 'html' = 'javascript';

  value = '';
  disabled = false;

  private editorView?: EditorView;
  private themeCompartment = new Compartment();
  private readOnlyCompartment = new Compartment();
  private editableCompartment = new Compartment();
  private languageCompartment = new Compartment();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString();
        this.value = newValue;
        this.ngZone.run(() => this.onChange(newValue));
      }
      if (update.focusChanged && !update.view.hasFocus) {
        this.ngZone.run(() => this.onTouched());
      }
    });

    const extensions: Extension[] = [
      history(),
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      bracketMatching(),
      closeBrackets(),
      keymap.of([...defaultKeymap, ...historyKeymap, ...closeBracketsKeymap]),
      this.languageCompartment.of(this.getLanguageExtension()),
      updateListener,
      this.themeCompartment.of(this.getThemeExtension()),
      this.readOnlyCompartment.of(EditorState.readOnly.of(this.readonly)),
      this.editableCompartment.of(EditorView.editable.of(!this.readonly)),
    ];

    if (this.placeholder) {
      extensions.push(placeholderExt(this.placeholder));
    }

    const state = EditorState.create({
      doc: this.value,
      extensions,
    });

    this.ngZone.runOutsideAngular(() => {
      this.editorView = new EditorView({
        state,
        parent: this.editorHost.nativeElement,
      });
    });

    this.applyEditorStyles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.editorView) return;

    if (changes['theme']) {
      this.editorView.dispatch({
        effects: this.themeCompartment.reconfigure(this.getThemeExtension()),
      });
    }

    if (changes['readonly']) {
      this.editorView.dispatch({
        effects: [
          this.readOnlyCompartment.reconfigure(EditorState.readOnly.of(this.readonly)),
          this.editableCompartment.reconfigure(EditorView.editable.of(!this.readonly)),
        ],
      });
    }

    if (changes['language']) {
      this.editorView.dispatch({
        effects: this.languageCompartment.reconfigure(this.getLanguageExtension()),
      });
    }

    this.applyEditorStyles();
  }

  ngOnDestroy(): void {
    this.editorView?.destroy();
  }

  writeValue(value: string | null): void {
    const newValue = value ?? '';
    this.value = newValue;
    if (this.editorView) {
      const currentValue = this.editorView.state.doc.toString();
      if (currentValue !== newValue) {
        this.editorView.dispatch({
          changes: { from: 0, to: currentValue.length, insert: newValue },
        });
      }
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.editorView) {
      this.editorView.dispatch({
        effects: [
          this.editableCompartment.reconfigure(EditorView.editable.of(!isDisabled && !this.readonly)),
        ],
      });
    }
  }

  private getThemeExtension(): Extension {
    if (this.theme === 'dark') {
      return oneDark;
    }
    return [];
  }

  private getLanguageExtension(): Extension {
    if (this.language === 'html') {
      return html();
    }
    return javascript({ typescript: true });
  }

  private applyEditorStyles(): void {
    if (!this.editorView) return;
    const dom = this.editorView.dom;
    dom.style.fontSize = this.fontSize;
    dom.style.lineHeight = String(this.lineHeight);
    const paddingValue = this.padding;
    const scroller = dom.querySelector('.cm-scroller') as HTMLElement | null;
    const content = dom.querySelector('.cm-content') as HTMLElement | null;
    const gutters = dom.querySelector('.cm-gutters') as HTMLElement | null;
    if (scroller) {
      scroller.style.padding = `${paddingValue} 0`;
      scroller.style.fontFamily = "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Source Code Pro', monospace";
    }
    if (content) {
      content.style.padding = `0 ${paddingValue}`;
      content.style.fontFamily = "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Source Code Pro', monospace";
    }
    if (gutters) {
      gutters.style.paddingLeft = paddingValue;
    }
    dom.style.height = '100%';
  }
}
