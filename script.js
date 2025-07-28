// script.js funcional para todas las páginas

document.addEventListener('DOMContentLoaded', function() {

    // --- Funciones de Utilidad ---

    function getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error al leer de localStorage para', key, e);
            return [];
        }
    }

    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error al guardar en localStorage para', key, e);
        }
    }

    function navigateTo(pageUrl) {
        window.location.href = pageUrl;
    }

    // --- Navegación cabecera ---
    document.querySelectorAll('header a').forEach(link => {
        link.addEventListener('click', function(event) {
            if (this.classList.contains('cursor-not-allowed')) {
                event.preventDefault();
                alert('La sección de Comunidad está en desarrollo.');
                return;
            }
            // Normal navigation for other links
        });
    });

    // --- Página index.html ---
    if (document.body.classList.contains('page-index')) {
        const btnRegistrarActividad = document.getElementById('btnRegistrarActividad');
        const mensajeMotivadorElem = document.getElementById('mensajeMotivador');
        const barraProgresoElem = document.getElementById('barraProgreso');
        const porcentajeCompletadoElem = document.getElementById('porcentajeCompletado');

        if (btnRegistrarActividad) {
            btnRegistrarActividad.addEventListener('click', function() {
                navigateTo('registro-actividad.html');
            });
        }

        function actualizarDatosIndex() {
            const actividades = getData('actividades');
            const hoy = new Date().toISOString().slice(0, 10);
            const actividadesHoy = actividades.filter(a => a.fecha === hoy);
            const totalDuracionHoy = actividadesHoy.reduce((sum, a) => sum + parseInt(a.duracion), 0);
            const metaDiaria = 30;
            let porcentaje = (totalDuracionHoy / metaDiaria) * 100;
            if (porcentaje > 100) porcentaje = 100;

            if (barraProgresoElem) {
                barraProgresoElem.style.width = `${porcentaje}%`;
            }
            if (porcentajeCompletadoElem) {
                porcentajeCompletadoElem.textContent = `${Math.round(porcentaje)}% completado (${totalDuracionHoy} de ${metaDiaria} minutos)`;
            }

            const mensajes = [
                "¡Sigue así, José! Cada paso cuenta.",
                "¡Tu esfuerzo de hoy te acerca a tus metas!",
                "¡Recuerda, la constancia es clave!",
                "¡Vamos, José! ¡Tú puedes lograrlo!",
                "¡Pequeños esfuerzos diarios hacen una gran diferencia!"
            ];
            if (mensajeMotivadorElem) {
                if (totalDuracionHoy >= metaDiaria) {
                    mensajeMotivadorElem.textContent = "¡Felicidades, José! ¡Has completado tu actividad diaria!";
                    mensajeMotivadorElem.classList.add('text-green-700');
                } else {
                    mensajeMotivadorElem.textContent = mensajes[Math.floor(Math.random() * mensajes.length)];
                    mensajeMotivadorElem.classList.remove('text-green-700');
                }
            }
        }
        actualizarDatosIndex();
    }

    // --- Página registro-actividad.html ---
    if (document.body.classList.contains('page-registro')) {
        const formRegistro = document.getElementById('formRegistroActividad');
        const esfuerzoSlider = document.getElementById('esfuerzoSlider');
        const esfuerzoValor = document.querySelectorAll('#esfuerzoValor');
        const linkAnadirEditarEjercicios = document.getElementById('linkAnadirEditarEjercicios');

        if (esfuerzoSlider && esfuerzoValor) {
            esfuerzoSlider.addEventListener('input', function() {
                esfuerzoValor.forEach(elem => elem.textContent = this.value);
            });
        }

        if (formRegistro) {
            formRegistro.addEventListener('submit', function(event) {
                event.preventDefault();
                const selectedActivityRadio = document.querySelector('input[name="selectedActivity"]:checked');
                const actividad = selectedActivityRadio ? selectedActivityRadio.value : '';
                const duracion = document.getElementById('duracion').value;
                const esfuerzo = esfuerzoSlider ? esfuerzoSlider.value : '3';
                const fecha = new Date().toISOString().slice(0, 10);

                if (!actividad) {
                    alert('Por favor, selecciona un tipo de actividad.');
                    return;
                }
                if (isNaN(duracion) || parseInt(duracion) <= 0) {
                    alert('Por favor, introduce una duración válida (número positivo).');
                    return;
                }

                let actividades = getData('actividades');
                actividades.push({ actividad: actividad, duracion: parseInt(duracion), esfuerzo: parseInt(esfuerzo), fecha: fecha });
                saveData('actividades', actividades);

                alert('¡Actividad guardada con éxito!');
                navigateTo('index.html');
            });
        }

        if (linkAnadirEditarEjercicios) {
            linkAnadirEditarEjercicios.addEventListener('click', function(event) {
                event.preventDefault();
                navigateTo('anadir-ejercicio.html');
            });
        }
    }

    // --- Página anadir-ejercicio.html ---
    if (document.body.classList.contains('page-anadir-ejercicio')) {
        const btnAnadirNuevoEjercicio = document.getElementById('btnAnadirNuevoEjercicio');
        const listaEjerciciosContainer = document.getElementById('listaEjercicios');
        const modalEjercicio = document.getElementById('modalEjercicio');
        const modalTitle = document.getElementById('modalTitle');
        const ejercicioNombreInput = document.getElementById('ejercicioNombre');
        const ejercicioDescripcionInput = document.getElementById('ejercicioDescripcion');
        const btnCancelarEjercicio = document.getElementById('btnCancelarEjercicio');
        const btnGuardarEjercicio = document.getElementById('btnGuardarEjercicio');

        let ejercicios = getData('ejerciciosPersonalizados');
        let editandoIndex = -1;

        function renderEjercicios() {
            listaEjerciciosContainer.innerHTML = '';
            if (ejercicios.length === 0) {
                listaEjerciciosContainer.innerHTML = '<p class="text-[#5c778a] text-center mt-8">No hay ejercicios personalizados. ¡Añade uno!</p>';
                return;
            }
            ejercicios.forEach((ej, index) => {
                const div = document.createElement('div');
                div.className = 'flex items-center gap-4 bg-gray-50 px-4 min-h-[72px] py-2 justify-between rounded-xl border border-solid border-[#eaeef1] mb-2';
                div.innerHTML = `
                    <div class="flex items-center gap-4">
                        <div class="text-[#101518] flex items-center justify-center rounded-lg bg-[#eaeef1] shrink-0 size-12">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM128,216a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H96a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h24A8,8,0,0,1,168,128Z"></path>
                            </svg>
                        </div>
                        <div class="flex flex-col justify-center">
                            <p class="text-[#101518] text-base font-medium leading-normal line-clamp-1">${ej.nombre}</p>
                            <p class="text-[#5c778a] text-sm font-normal leading-normal line-clamp-2">${ej.descripcion}</p>
                        </div>
                    </div>
                    <div class="shrink-0">
                        <button class="btn-editar-ejercicio flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#eaeef1] text-[#101518] text-sm font-medium leading-normal w-fit" data-index="${index}">
                            <span class="truncate">Editar</span>
                        </button>
                        <button class="btn-eliminar-ejercicio flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-red-100 text-red-700 text-sm font-medium leading-normal w-fit ml-2" data-index="${index}">
                            <span class="truncate">Eliminar</span>
                        </button>
                    </div>
                `;
                listaEjerciciosContainer.appendChild(div);
            });

            document.querySelectorAll('.btn-editar-ejercicio').forEach(button => {
                button.addEventListener('click', function() {
                    editandoIndex = parseInt(this.dataset.index);
                    const ejercicioAEditar = ejercicios[editandoIndex];
                    modalTitle.textContent = 'Editar Ejercicio';
                    ejercicioNombreInput.value = ejercicioAEditar.nombre;
                    ejercicioDescripcionInput.value = ejercicioAEditar.descripcion;
                    modalEjercicio.classList.remove('hidden');
                });
            });

            document.querySelectorAll('.btn-eliminar-ejercicio').forEach(button => {
                button.addEventListener('click', function() {
                    if (confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
                        const indexToDelete = parseInt(this.dataset.index);
                        ejercicios.splice(indexToDelete, 1);
                        saveData('ejerciciosPersonalizados', ejercicios);
                        renderEjercicios();
                    }
                });
            });
        }

        if (btnAnadirNuevoEjercicio) {
            btnAnadirNuevoEjercicio.addEventListener('click', function() {
                editandoIndex = -1;
                modalTitle.textContent = 'Añadir Nuevo Ejercicio';
                ejercicioNombreInput.value = '';
                ejercicioDescripcionInput.value = '';
                modalEjercicio.classList.remove('hidden');
            });
        }

        if (btnCancelarEjercicio) {
            btnCancelarEjercicio.addEventListener('click', function() {
                modalEjercicio.classList.add('hidden');
            });
        }

        if (btnGuardarEjercicio) {
            btnGuardarEjercicio.addEventListener('click', function() {
                const nombre = ejercicioNombreInput.value.trim();
                const descripcion = ejercicioDescripcionInput.value.trim();
                if (!nombre) {
                    alert('El nombre del ejercicio no puede estar vacío.');
                    return;
                }
                if (editandoIndex === -1) {
                    ejercicios.push({ nombre, descripcion });
                } else {
                    ejercicios[editandoIndex] = { nombre, descripcion };
                }
                saveData('ejerciciosPersonalizados', ejercicios);
                renderEjercicios();
                modalEjercicio.classList.add('hidden');
            });
        }
        renderEjercicios();
    }

    // --- Página progreso.html ---
    if (document.body.classList.contains('page-progreso')) {
        // -----------------------------------
        // GRAFICA DINÁMICA (días o semanas)
        // -----------------------------------
        const graficaProgreso = document.getElementById('graficaProgreso');
        const etiquetasGrafica = document.getElementById('etiquetasGrafica');
        const modoGrafica = document.getElementById('modoGrafica');

        function getLastNDaysLabels(n) {
            const labels = [];
            const today = new Date();
            for (let i = n - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                labels.push(d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
            }
            return labels;
        }

        function getLastNWeeksLabels(n) {
            const labels = [];
            const today = new Date();
            for (let i = n - 1; i >= 0; i--) {
                const start = new Date(today);
                start.setDate(today.getDate() - 7 * i);
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                labels.push(
                  `Del ${start.getDate()}/${start.getMonth()+1} al ${end.getDate()}/${end.getMonth()+1}`
                );
            }
            return labels;
        }

        function getMinutosPorUltimosNDias(actividades, n) {
            const hoy = new Date();
            hoy.setHours(0,0,0,0);
            const resultado = [];
            for (let i = n - 1; i >= 0; i--) {
                const dia = new Date(hoy);
                dia.setDate(hoy.getDate() - i);
                const fechaStr = dia.toISOString().slice(0, 10);
                const minutos = actividades
                  .filter(a => a.fecha === fechaStr)
                  .reduce((sum, a) => sum + a.duracion, 0);
                resultado.push(minutos);
            }
            return resultado;
        }

        function getMinutosPorUltimasNSemanas(actividades, n) {
            const hoy = new Date();
            hoy.setHours(0,0,0,0);
            const resultado = [];
            for (let i = n - 1; i >= 0; i--) {
                const inicio = new Date(hoy);
                inicio.setDate(hoy.getDate() - 7 * i);
                const fin = new Date(inicio);
                fin.setDate(inicio.getDate() + 6);
                const minutos = actividades
                  .filter(a => {
                      const actDate = new Date(a.fecha);
                      actDate.setHours(0,0,0,0);
                      return actDate >= inicio && actDate <= fin;
                  })
                  .reduce((sum, a) => sum + a.duracion, 0);
                resultado.push(minutos);
            }
            return resultado;
        }

        function renderGrafica(actividades, modo) {
            graficaProgreso.innerHTML = '';
            etiquetasGrafica.innerHTML = '';
            let valores = [];
            let etiquetas = [];
            let maximo = 1;
            if (modo === 'dias') {
                valores = getMinutosPorUltimosNDias(actividades, 7);
                etiquetas = getLastNDaysLabels(7);
                maximo = Math.max(...valores, 30);
            } else {
                valores = getMinutosPorUltimasNSemanas(actividades, 4);
                etiquetas = getLastNWeeksLabels(4);
                maximo = Math.max(...valores, 100);
            }
            valores.forEach((minutos, i) => {
                const altura = (minutos / maximo) * 100;
                const bar = document.createElement('div');
                bar.className = 'flex-1 bg-[#1993e5] rounded-t-lg transition-all duration-500 relative flex justify-center';
                bar.style.height = `${altura}%`;
                bar.style.minWidth = '40px';
                bar.style.maxWidth = '60px';
                bar.title = minutos + ' min';
                bar.innerHTML = `<span class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#101518] font-bold">${minutos}</span>`;
                graficaProgreso.appendChild(bar);
                const label = document.createElement('span');
                label.className = 'text-[#101518] text-xs font-bold text-center w-full';
                label.textContent = etiquetas[i];
                etiquetasGrafica.appendChild(label);
            });
        }

        // -----------------------------------
        // FUNCIONES DE PROGRESO Y LOGROS
        // -----------------------------------
        const diasActivosConsecutivosElem = document.getElementById('diasActivosConsecutivos');
        const cambioDiasElem = document.getElementById('cambioDias');
        const totalMinutosElem = document.getElementById('totalMinutos');
        const cambioTotalElem = document.getElementById('cambioTotal');
        const logrosContainer = document.getElementById('logrosContainer');

        function actualizarDatosProgreso() {
            const actividades = getData('actividades');
            renderGrafica(actividades, modoGrafica.value);

            // Calculo de Días Activos Consecutivos
            const hoy = new Date();
            const fechasActividad = [...new Set(actividades.map(a => a.fecha))].sort();
            let diasConsecutivos = 0;
            if (fechasActividad.length > 0) {
                let currentDay = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
                let previousDay = new Date(currentDay);
                previousDay.setDate(currentDay.getDate() - 1);

                for (let i = fechasActividad.length - 1; i >= 0; i--) {
                    const activityDay = new Date(fechasActividad[i]);
                    activityDay.setHours(0,0,0,0);
                    currentDay.setHours(0,0,0,0);
                    previousDay.setHours(0,0,0,0);

                    if (activityDay.getTime() === currentDay.getTime()) {
                        diasConsecutivos++;
                        currentDay.setDate(currentDay.getDate() - 1);
                    } else if (activityDay.getTime() === previousDay.getTime()) {
                        diasConsecutivos++;
                        currentDay.setDate(currentDay.getDate() - 1);
                        previousDay.setDate(previousDay.getDate() - 1);
                    } else { break; }
                    previousDay = new Date(currentDay);
                    previousDay.setDate(currentDay.getDate() - 1);
                }
            }
            if (diasActivosConsecutivosElem) diasActivosConsecutivosElem.textContent = diasConsecutivos;
            if (cambioDiasElem) cambioDiasElem.textContent = '';
            const totalMinutosAcumulados = actividades.reduce((sum, act) => sum + act.duracion, 0);
            if (totalMinutosElem) totalMinutosElem.textContent = totalMinutosAcumulados;
            if (cambioTotalElem) {
                if (actividades.length > 0) {
                    const lastActivityDuration = actividades[actividades.length -1].duracion;
                    cambioTotalElem.textContent = `+${lastActivityDuration}`;
                    cambioTotalElem.className = 'text-[#078838] text-base font-medium leading-normal';
                } else {
                    cambioTotalElem.textContent = '';
                }
            }
            // Logros
            const logros = [
                { id: 'logro7Dias', titulo: 'Primeros 7 Días Activos', minConsecutiveDays: 7, imagen: 'https://via.placeholder.com/150/FFD700/000000?text=7+Dias' },
                { id: 'logro100Min', titulo: '100 Minutos de Ejercicio', minTotalMinutes: 100, imagen: 'https://via.placeholder.com/150/ADFF2F/000000?text=100+Min' },
                { id: 'logro300Min', titulo: '300 Minutos de Ejercicio', minTotalMinutes: 300, imagen: 'https://via.placeholder.com/150/87CEEB/000000?text=300+Min' },
                { id: 'logroMesActivo', titulo: 'Activo por un Mes', minTotalDaysInMonth: 20, imagen: 'https://via.placeholder.com/150/FFA500/000000?text=Mes+Activo' }
            ];
            logrosContainer.innerHTML = '';
            logros.forEach(logro => {
                let logrado = false;
                if (logro.minConsecutiveDays && diasConsecutivos >= logro.minConsecutiveDays) {
                    logrado = true;
                }
                if (logro.minTotalMinutes && totalMinutosAcumulados >= logro.minTotalMinutes) {
                    logrado = true;
                }
                if (logrado) {
                    const logroDiv = document.createElement('div');
                    logroDiv.className = 'flex flex-col gap-3 pb-3';
                    logroDiv.innerHTML = `
                        <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style='background-image: url("${logro.imagen}");'></div>
                        <p class="text-[#0e161b] text-base font-medium leading-normal">${logro.titulo}</p>
                    `;
                    logrosContainer.appendChild(logroDiv);
                }
            });
            if (logrosContainer.innerHTML === '') {
                logrosContainer.innerHTML = '<p class="text-[#5c778a] text-center mt-8">¡Sigue ejercitándote para desbloquear logros!</p>';
            }
        }
        if (modoGrafica) {
            modoGrafica.addEventListener('change', actualizarDatosProgreso);
        }
        actualizarDatosProgreso();

        // -----------------------------------
        // CALENDARIO MODERNO
        // -----------------------------------
        function pintarCalendarioEntrenamientos() {
            const calendarDays = document.getElementById('calendarDays');
            const calMonthYear = document.getElementById('calMonthYear');
            const prevMonth = document.getElementById('prevMonth');
            const nextMonth = document.getElementById('nextMonth');
            const modalResumenDia = document.getElementById('modalResumenDia');
            const resumenFecha = document.getElementById('resumenFecha');
            const resumenInfo = document.getElementById('resumenInfo');
            const btnCerrarResumen = document.getElementById('btnCerrarResumen');

            if (!calendarDays) return;

            let today = new Date();
            let mes = today.getMonth();
            let anio = today.getFullYear();

            prevMonth.onclick = () => { mes--; if(mes < 0){ mes=11; anio--; } renderCalendar(); };
            nextMonth.onclick = () => { mes++; if(mes > 11){ mes=0; anio++; } renderCalendar(); };
            if(btnCerrarResumen) btnCerrarResumen.onclick = () => { modalResumenDia.classList.add('hidden'); };

            function renderCalendar() {
                calendarDays.innerHTML = '';
                let actividades = getData('actividades');
                let actividadesPorFecha = {};
                actividades.forEach(a => {
                    if (!actividadesPorFecha[a.fecha]) actividadesPorFecha[a.fecha] = [];
                    actividadesPorFecha[a.fecha].push(a);
                });

                let primerDiaMes = new Date(anio, mes, 1);
                let primerDiaSemana = (primerDiaMes.getDay() + 6) % 7;
                let diasEnMes = new Date(anio, mes + 1, 0).getDate();

                calMonthYear.textContent = primerDiaMes.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^./, str => str.toUpperCase());

                for (let i = 0; i < primerDiaSemana; i++) {
                    const empty = document.createElement('div');
                    calendarDays.appendChild(empty);
                }
                for (let dia = 1; dia <= diasEnMes; dia++) {
                    const fecha = new Date(anio, mes, dia);
                    const fechaISO = fecha.toISOString().slice(0,10);
                    const divDia = document.createElement('div');
                    divDia.className =
                      "relative flex items-center justify-center aspect-square rounded-xl text-[#101518] font-bold cursor-pointer transition-all duration-200 select-none hover:bg-[#eaeef1]";
                    divDia.textContent = dia;
                    if (
                      fecha.getDate() === today.getDate() &&
                      fecha.getMonth() === today.getMonth() &&
                      fecha.getFullYear() === today.getFullYear()
                    ) {
                        divDia.classList.add("ring-2", "ring-[#1993e5]");
                    }
                    if (actividadesPorFecha[fechaISO]) {
                        divDia.classList.add("bg-[#1993e5]", "text-white", "hover:bg-[#3ea6f6]");
                        divDia.title = "Entrenamientos: " + actividadesPorFecha[fechaISO].length;
                        divDia.onclick = () => {
                            mostrarResumenDia(fechaISO, actividadesPorFecha[fechaISO]);
                        };
                        const punto = document.createElement("span");
                        punto.className = "absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FFD600] rounded-full";
                        divDia.appendChild(punto);
                    }
                    calendarDays.appendChild(divDia);
                }
            }
            function mostrarResumenDia(fechaISO, actividades) {
                if (!modalResumenDia) return;
                const fechaObj = new Date(fechaISO);
                resumenFecha.textContent = fechaObj.toLocaleDateString('es-ES', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
                let minutos = actividades.reduce((sum, a) => sum + a.duracion, 0);
                let lista = actividades.map(a =>
                  `<li class="mb-1"><span class="font-semibold">${a.actividad}</span> - ${a.duracion} min. (esfuerzo ${a.esfuerzo})</li>`
                ).join('');
                resumenInfo.innerHTML =
                  `<p class="mb-2"><span class="font-bold text-[#1993e5]">${minutos}</span> minutos en total.</p>
                  <ul class="list-disc pl-5">${lista}</ul>`;
                modalResumenDia.classList.remove('hidden');
            }
            renderCalendar();
        }
        pintarCalendarioEntrenamientos();
    }
});