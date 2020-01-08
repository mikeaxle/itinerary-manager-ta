import { AbstractControl } from '@angular/forms';

// export function urlValidator(control: AbstractControl) {
//     if (!control.value.startsWith('https') || !control.value.includes('.me')) {
//         return { urlValid: true };
//     }
//     return null;
// }

export function nonZero(control: AbstractControl): { [key: string]: any; } {
    if (Number(control.value) < 1) {
        return { nonZero: true };
    } else {
        return null;
    }
}
