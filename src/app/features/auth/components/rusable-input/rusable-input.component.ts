import { Component, forwardRef, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rusable-input',
  standalone: true,
  imports: [],
  templateUrl: './rusable-input.component.html',
  styleUrl: './rusable-input.component.css',
    providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RusableInputComponent), multi: true },
  ],
})
export class RusableInputComponent implements ControlValueAccessor{
  @Input()type!:string;
@Input()placholder!:string;
@Input()label!:string;
@Input()id!:string;
  @Input() control: AbstractControl | null = null;
    @Input() group: FormGroup | null = null;
value:string='';
 onChange = (value: string) => {};
  disabled = false;
  onTouched = () => {};
writeValue(obj: any): void {
 this.value=obj
}
registerOnChange(fn: any): void {
this.onChange=fn
}
registerOnTouched(fn: any): void {
this.onTouched=fn
}
setDisabledState?(isDisabled: boolean): void {
this.disabled=isDisabled
}

onInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.value = input.value;
  this.onChange(this.value);
  this.onTouched();
}

  flag = true;
  toggle() {
    if (this.id == 'password' || this.id == 'rePassword') {
      this.flag = !this.flag;
      this.type = this.flag ? 'password' : 'text';
    }
  }

}
