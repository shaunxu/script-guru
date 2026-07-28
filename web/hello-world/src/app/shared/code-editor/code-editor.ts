import { Component, Input, HostBinding } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: CodeEditor, multi: true }
  ]
})
export class CodeEditor implements ControlValueAccessor {
  @HostBinding('style.display') readonly display = 'block';
  @HostBinding('style.width') readonly width = '100%';
  @HostBinding('style.height') get hostHeight(): string {
    if (this.height) return this.height;
    if (this.rows) return 'auto';
    return '100%';
  }

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

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.onChange(this.value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}

