import { Component, OnInit, ViewChild } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/tools/notification-service';
import { AuthServices } from '../../services/auth-services';
import { DatosAlumno } from '../../interfaces/usuarios-interfaces';
import { AlumnoService } from '../../services/alumnos-service';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-alumnos-screen',
  imports: [...SHARED_IMPORTS],
  templateUrl: './alumnos-screen.html',
  styleUrl: './alumnos-screen.scss',
})
export class AlumnosScreen implements OnInit {
  public name_user: string = '';
  public rol: string = '';
  public lista_alumnos: any[] = [];
  public searchFilter: string = '';

  //Declaramos las columnas que se mostrarán en la tabla
  public displayedColumns: string[] = [
    'id_alumno',
    'nombre',
    'email',
    'fecha_nacimiento',
    'telefono',
    'curp',
    'carrera',
    'editar',
    'eliminar',
  ];

  dataSource = new MatTableDataSource<DatosAlumno>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthServices,
    private alumnoService: AlumnoService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer,
  ) {}

  ngOnInit(): void {
    this.name_user = this.authService.getUserCompleteName();
    this.rol = this.authService.getUserGroup();
    this.obtenerAlumnos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.configureDataSourceProperties();
  }

  /**
   * Configura el predicado de filtro y el accessor de ordenamiento para la tabla
   */
  private configureDataSourceProperties(): void {
    // Configurar filtro personalizado
    this.dataSource.filterPredicate = (data: DatosAlumno, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.id_alumno.toString().toLowerCase().includes(searchStr) ||
        data.first_name.toLowerCase().includes(searchStr) ||
        data.last_name.toLowerCase().includes(searchStr) ||
        `${data.first_name} ${data.last_name}`.toLowerCase().includes(searchStr) ||
        data.email.toLowerCase().includes(searchStr) ||
        (data.carrera?.toString() || '').toLowerCase().includes(searchStr)
      );
    };

    // Configurar accessor de ordenamiento personalizado
    this.dataSource.sortingDataAccessor = (data: DatosAlumno, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'nombre':
          return `${data.first_name} ${data.last_name}`.toLowerCase();
        case 'id_alumno':
          return data.id_alumno;
        case 'carrera':
          return (data.carrera?.toString() || '').toLowerCase();
        default:
          return (data as any)[sortHeaderId];
      }
    };
  }

  /**
   * Actualiza el filtro en la tabla
   */
  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchFilter = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Anunciador de cambios de ordenamiento para accesibilidad
   */
  public announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Ordenado ${sortState.direction === 'asc' ? 'ascendente' : 'descendente'}`);
    } else {
      this._liveAnnouncer.announce('Ordenamiento eliminado');
    }
  }

  //Función para obtener la lista de alumnos registrados
  public obtenerAlumnos(): void {
    this.alumnoService.obtenerListaAlumnos().subscribe({
      next: (response) => {
        this.lista_alumnos = response;

        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach((usuario) => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
        }

        this.dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]);

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }

        if (this.sort) {
          this.dataSource.sort = this.sort;
        }

        this.configureDataSourceProperties();
      },
      error: () => {
        this.notificationService.error('No se pudo obtener la lista de alumnos');
      },
    });
  }

  public goEditar(id: number) {
    this.router.navigate(['/registro-usuarios', 'alumno', id]);
  }

  public delete(id: number) {}
}
