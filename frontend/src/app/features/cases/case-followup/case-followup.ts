import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CaseService } from '../case.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-case-followup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `

<h2 mat-dialog-title>

{{ isStatusMode() ? 'Avanzar Estado del Caso' : 'Agregar Seguimiento' }}

</h2>

<mat-dialog-content class="content">

<!-- ESTADO ACTUAL -->

<div *ngIf="isStatusMode()" class="status-box">

<p><strong>Estado actual:</strong> {{ data.status }}</p>

<p><strong>Siguiente estado:</strong> {{ getNextStatus(data.status) }}</p>

</div>

<!-- COMENTARIO -->

<form [formGroup]="form">

<mat-form-field appearance="outline" class="full">

<mat-label>Comentario</mat-label>

<textarea matInput rows="4" formControlName="message"></textarea>

</mat-form-field>

</form>

<!-- ARCHIVOS -->

<div class="files">

<button mat-raised-button color="accent" (click)="fileInput.click()">
Seleccionar archivos
</button>

<input
#fileInput
type="file"
multiple
hidden
(change)="onFilesSelected($event)"
/>

<div *ngIf="selectedFiles.length">

<p><strong>Archivos seleccionados:</strong></p>

<mat-chip-listbox>

<mat-chip
*ngFor="let f of selectedFiles; let i = index"
removable="true"
(removed)="removeFile(i)">

{{ f.name }}

<button matChipRemove>
<mat-icon>cancel</mat-icon>
</button>

</mat-chip>

</mat-chip-listbox>

</div>

</div>

</mat-dialog-content>

<mat-dialog-actions align="end">

<button mat-button (click)="dialogRef.close()">Cancelar</button>

<button mat-raised-button color="primary" (click)="submit()">

{{ isStatusMode() ? 'Cambiar Estado' : 'Guardar Seguimiento' }}

</button>

</mat-dialog-actions>
`,
  styles: [`

.full{
width:100%;
margin-top:15px;
margin-bottom:20px;
}

mat-chip{
max-width:250px;
overflow:hidden;
text-overflow:ellipsis;
}

.content{
padding-top:5px;
}

.files{
margin-top:15px;
}

.status-box{
background:#f5f5f5;
padding:10px;
border-radius:6px;
margin-bottom:15px;
}

mat-dialog-content{
padding-top:10px;
}

li{
display:flex;
align-items:center;
gap:10px;
color: red;
}

mat-dialog-actions{
margin-top:10px;
}

`]
})
export class CaseFollowupComponent {

form:any;

selectedFiles:File[] = [];

constructor(
@Inject(MAT_DIALOG_DATA) public data:any,
private fb:FormBuilder,
private caseService:CaseService,
private notification:NotificationService,
public dialogRef:MatDialogRef<CaseFollowupComponent>
){

this.form = this.fb.group({
message:['']
});

}

isStatusMode(){

return this.data.mode === 'status';

}

getNextStatus(status:string){

const flow:any = {

REPORTAR_ARL:'INVESTIGACION',
INVESTIGACION:'PLAN_ACCION',
PLAN_ACCION:'CERRADO'

};

return flow[status] || 'N/A';

}

onFilesSelected(event:any){

const files:FileList = event.target.files;

for(let i=0;i<files.length;i++){

this.selectedFiles.push(files[i]);

}

}

removeFile(index:number){

  this.selectedFiles.splice(index,1);

}

submit(){

const message = this.form.value.message || '';

if(!message && this.selectedFiles.length === 0){

this.notification.error("Debe ingresar comentario o adjuntar archivo");

return;

}

if(this.isStatusMode()){

this.caseService.advanceStatus(this.data.caseId,message,this.selectedFiles)
.subscribe(()=>{

this.notification.success("Estado actualizado correctamente");

this.dialogRef.close(true);

});

}else{

this.caseService.addSeguimiento(this.data.caseId,message,this.selectedFiles)
.subscribe(()=>{

this.notification.success("Seguimiento agregado correctamente");

this.dialogRef.close(true);

});

}

}

}