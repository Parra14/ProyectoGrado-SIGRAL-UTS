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
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule
  ],
  templateUrl: './case-followup.html',
  styleUrls: ['./case-followup.scss']
})
export class CaseFollowupComponent {

  form: any;
  selectedFiles: File[] = [];
  maxMessageLength = 500;
  isDragOver = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private caseService: CaseService,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<CaseFollowupComponent>
  ) {
    this.form = this.fb.group({
      message: ['', [Validators.maxLength(this.maxMessageLength)]]
    });
  }

  isStatusMode(): boolean {
    return this.data.mode === 'status';
  }

  getNextStatus(status: string): string {
    const flow: any = {
      REPORTAR_ARL: 'INVESTIGACION',
      INVESTIGACION: 'PLAN_ACCION',
      PLAN_ACCION: 'CERRADO'
    };
    return flow[status] || 'N/A';
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    return `status-${status}`;
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  // Métodos para Drag & Drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  // Método auxiliar para procesar archivos
  private processFiles(files: File[]): void {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      // Validar tamaño máximo (10MB)
      if (file.size <= 10 * 1024 * 1024) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    // Agregar archivos válidos
    validFiles.forEach(file => {
      // Evitar duplicados
      if (!this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.push(file);
      }
    });

    // Mostrar mensajes usando error() y success() que existen
    if (invalidFiles.length > 0) {
      this.notification.error(
        `Los siguientes archivos exceden el límite de 10MB: ${invalidFiles.join(', ')}`
      );
    }

    if (validFiles.length > 0) {
      this.notification.success(`${validFiles.length} archivo(s) agregado(s) correctamente`);
    }
  }

  // Método para limpiar todos los archivos
  clearAllFiles(): void {
    if (this.selectedFiles.length > 0) {
      this.selectedFiles = [];
      // Usamos success en lugar de info
      this.notification.success('Todos los archivos han sido eliminados');
    }
  }

  removeFile(event: MouseEvent, index: number): void {
    event.stopPropagation();
    
    if (index >= 0 && index < this.selectedFiles.length) {
      const fileName = this.selectedFiles[index].name;
      this.selectedFiles.splice(index, 1);
      // Usamos success para confirmar eliminación
      this.notification.success(`Archivo "${fileName}" eliminado`);
    }
  }

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'description';
    if (['xls', 'xlsx'].includes(ext || '')) return 'table_chart';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
    return 'insert_drive_file';
  }

  getFileIconClass(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') return 'icon-pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'icon-doc';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'icon-image';
    return 'icon-other';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  submit(): void {
    const message = this.form.value.message || '';

    if (!message && this.selectedFiles.length === 0) {
      this.notification.error("Debe ingresar un comentario o adjuntar un archivo");
      return;
    }

    if (this.isStatusMode()) {
      this.caseService.advanceStatus(this.data.caseId, message, this.selectedFiles)
        .subscribe({
          next: () => {
            this.notification.success("Estado actualizado correctamente");
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.notification.error("Error al actualizar el estado");
            console.error('Error:', err);
          }
        });
    } else {
      this.caseService.addSeguimiento(this.data.caseId, message, this.selectedFiles)
        .subscribe({
          next: () => {
            this.notification.success("Seguimiento agregado correctamente");
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.notification.error("Error al agregar el seguimiento");
            console.error('Error:', err);
          }
        });
    }
  }
}