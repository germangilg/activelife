document.addEventListener('DOMContentLoaded', function() {

    // CABECERA RESPONSIVE
    const btnMenuMovil = document.getElementById('btnMenuMovil');
    const menuMovil = document.getElementById('menuMovil');
    if (btnMenuMovil && menuMovil) {
      btnMenuMovil.addEventListener('click', () => {
        menuMovil.classList.toggle('hidden');
      });
      // Cierra el menú móvil al hacer click fuera
      document.addEventListener('click', function(e) {
        if (!btnMenuMovil.contains(e.target) && !menuMovil.contains(e.target)) {
          menuMovil.classList.add('hidden');
        }
      });
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
                const repeticiones = document.getElementById('repeticiones').value || "0";
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
                if (isNaN(repeticiones) || parseInt(repeticiones) < 0) {
                    alert('Por favor, introduce un número de repeticiones válido (0 o más).');
                    return;
                }

                let actividades = getData('actividades');
                actividades.push({ 
                  actividad: actividad, 
                  duracion: parseInt(duracion), 
                  repeticiones: parseInt(repeticiones), 
                  esfuerzo: parseInt(esfuerzo), 
                  fecha: fecha 
                });
                saveData('actividades', actividades);

                alert('¡Actividad guardada con éxito!');
                window.location.href = 'index.html';
            });
        }

        if (linkAnadirEditarEjercicios) {
            linkAnadirEditarEjercicios.addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = 'anadir-ejercicio.html';
            });
        }
    }

    // --- Página progreso.html ---
    if (document.body.classList.contains('page-progreso')) {
        let periodoOffset = 0;
        const graficaProgreso = document.getElementById('graficaProgreso');
        const graficaRepeticiones = document.getElementById('graficaRepeticiones');
        const modoGrafica = document.getElementById('modoGrafica');
        const btnPeriodoAnterior = document.getElementById('btnPeriodoAnterior');
        const btnPeriodoSiguiente = document.getElementById('btnPeriodoSiguiente');
        const etiquetaPeriodo = document.getElementById('etiquetaPeriodo');
        const totalRepeticionesElem = document.getElementById('totalRepeticiones');
        const cambioRepsElem = document.getElementById('cambioReps');

        if (btnPeriodoAnterior && btnPeriodoSiguiente && etiquetaPeriodo && modoGrafica) {
            btnPeriodoAnterior.addEventListener('click', () => {
                periodoOffset += 1;
                actualizarDatosProgreso();
            });
            btnPeriodoSiguiente.addEventListener('click', () => {
                if (periodoOffset > 0) {
                    periodoOffset -= 1;
                    actualizarDatosProgreso();
                }
            });
            modoGrafica.addEventListener('change', () => {
                periodoOffset = 0;
                actualizarDatosProgreso();
            });
        }

        // SIEMPRE DE LUNES A DOMINGO
        function getWeekMonday(date) {
            const day = date.getDay();
            const diff = (day === 0 ? -6 : 1) - day;
            const monday = new Date(date);
            monday.setDate(date.getDate() + diff);
            monday.setHours(0,0,0,0);
            return monday;
        }
        function getNDaysLabelsMondayToSunday(offset) {
            const labels = [];
            const today = new Date();
            today.setHours(0,0,0,0);
            let monday = getWeekMonday(today);
            monday.setDate(monday.getDate() - offset * 7);
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                labels.push(d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
            }
            return labels;
        }
        function getMinutosPorSemanaLunesADomingo(actividades, offset) {
            const resultado = [];
            const today = new Date();
            today.setHours(0,0,0,0);
            let monday = getWeekMonday(today);
            monday.setDate(monday.getDate() - offset * 7);
            for (let i = 0; i < 7; i++) {
                const dia = new Date(monday);
                dia.setDate(monday.getDate() + i);
                const fechaStr = dia.toISOString().slice(0, 10);
                const minutos = actividades
                  .filter(a => a.fecha === fechaStr)
                  .reduce((sum, a) => sum + (a.duracion || 0), 0);
                resultado.push(minutos);
            }
            return resultado;
        }
        function getRepsPorSemanaLunesADomingo(actividades, offset) {
            const resultado = [];
            const today = new Date();
            today.setHours(0,0,0,0);
            let monday = getWeekMonday(today);
            monday.setDate(monday.getDate() - offset * 7);
            for (let i = 0; i < 7; i++) {
                const dia = new Date(monday);
                dia.setDate(monday.getDate() + i);
                const fechaStr = dia.toISOString().slice(0, 10);
                const reps = actividades
                  .filter(a => a.fecha === fechaStr)
                  .reduce((sum, a) => sum + (a.repeticiones || 0), 0);
                resultado.push(reps);
            }
            return resultado;
        }

        function getLastNWeeksLabelsConOffset(n, offset) {
            const labels = [];
            const hoy = new Date();
            for (let i = n - 1; i >= 0; i--) {
                const start = new Date(hoy);
                start.setDate(hoy.getDate() - 7 * (i + offset));
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                labels.push(`Del ${start.getDate()}/${start.getMonth()+1} al ${end.getDate()}/${end.getMonth()+1}`);
            }
            return labels;
        }
        function getMinutosPorUltimasNSemanasConOffset(actividades, n, offset) {
            const hoy = new Date();
            hoy.setHours(0,0,0,0);
            const resultado = [];
            for (let i = n - 1; i >= 0; i--) {
                const inicio = new Date(hoy);
                inicio.setDate(hoy.getDate() - 7 * (i + offset));
                const fin = new Date(inicio);
                fin.setDate(inicio.getDate() + 6);
                const minutos = actividades
                  .filter(a => {
                      const actDate = new Date(a.fecha);
                      actDate.setHours(0,0,0,0);
                      return actDate >= inicio && actDate <= fin;
                  })
                  .reduce((sum, a) => sum + (a.duracion || 0), 0);
                resultado.push(minutos);
            }
            return resultado;
        }
        function getRepsPorUltimasNSemanasConOffset(actividades, n, offset) {
            const hoy = new Date();
            hoy.setHours(0,0,0,0);
            const resultado = [];
            for (let i = n - 1; i >= 0; i--) {
                const inicio = new Date(hoy);
                inicio.setDate(hoy.getDate() - 7 * (i + offset));
                const fin = new Date(inicio);
                fin.setDate(inicio.getDate() + 6);
                const reps = actividades
                  .filter(a => {
                      const actDate = new Date(a.fecha);
                      actDate.setHours(0,0,0,0);
                      return actDate >= inicio && actDate <= fin;
                  })
                  .reduce((sum, a) => sum + (a.repeticiones || 0), 0);
                resultado.push(reps);
            }
            return resultado;
        }

        function renderGrafica(actividades, modo) {
            graficaProgreso.innerHTML = '';
            graficaRepeticiones.innerHTML = '';
            let valores = [], etiquetas = [], maximo = 1;
            let repeticionesValores = [];
            let maxReps = 1;
            if (modo === 'dias') {
                valores = getMinutosPorSemanaLunesADomingo(actividades, periodoOffset);
                repeticionesValores = getRepsPorSemanaLunesADomingo(actividades, periodoOffset);
                etiquetas = getNDaysLabelsMondayToSunday(periodoOffset);
                maximo = Math.max(...valores, 30);
                maxReps = Math.max(...repeticionesValores, 10);
                // Etiqueta de periodo
                const today = new Date();
                today.setHours(0,0,0,0);
                let monday = getWeekMonday(today);
                monday.setDate(monday.getDate() - periodoOffset * 7);
                let sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                etiquetaPeriodo.textContent = `(${monday.getDate()}/${monday.getMonth()+1} al ${sunday.getDate()}/${sunday.getMonth()+1})`;
                btnPeriodoAnterior.classList.remove('hidden');
                btnPeriodoSiguiente.classList.remove('hidden');
                btnPeriodoSiguiente.disabled = periodoOffset === 0;
            } else {
                valores = getMinutosPorUltimasNSemanasConOffset(actividades, 4, periodoOffset);
                repeticionesValores = getRepsPorUltimasNSemanasConOffset(actividades, 4, periodoOffset);
                etiquetas = getLastNWeeksLabelsConOffset(4, periodoOffset);
                maximo = Math.max(...valores, 100);
                maxReps = Math.max(...repeticionesValores, 10);
                // Etiqueta rango de la semana principal
                const hoy = new Date();
                hoy.setHours(0,0,0,0);
                const inicio = new Date(hoy);
                inicio.setDate(hoy.getDate() - 7 * periodoOffset - 6);
                const fin = new Date(hoy);
                fin.setDate(hoy.getDate() - 7 * periodoOffset);
                etiquetaPeriodo.textContent = `(${inicio.getDate()}/${inicio.getMonth()+1} al ${fin.getDate()}/${fin.getMonth()+1})`;
                btnPeriodoAnterior.classList.remove('hidden');
                btnPeriodoSiguiente.classList.remove('hidden');
                btnPeriodoSiguiente.disabled = periodoOffset === 0;
            }

            // MINUTOS
            for (let i = 0; i < valores.length; i++) {
                const minutos = valores[i];
                const label = etiquetas[i];
                const col = document.createElement('div');
                col.className = 'flex flex-col-reverse items-center w-12';
                const labelEl = document.createElement('span');
                labelEl.className = 'mt-1 text-xs font-bold text-[#101518] text-center';
                labelEl.textContent = label;
                col.appendChild(labelEl);
                const barraCont = document.createElement('div');
                barraCont.className = 'relative flex flex-col items-center justify-end';
                barraCont.style.height = '100px';
                const bar = document.createElement('div');
                bar.className = 'bg-[#1993e5] rounded-t-lg w-8 transition-all duration-500';
                bar.style.height = `${(minutos / maximo) * 90}px`;
                barraCont.appendChild(bar);
                const val = document.createElement('span');
                val.className = 'mb-2 text-xs text-[#101518] font-bold absolute -top-6 left-1/2 -translate-x-1/2';
                val.textContent = minutos;
                barraCont.appendChild(val);
                col.appendChild(barraCont);
                graficaProgreso.appendChild(col);
            }
            // REPETICIONES
            for (let i = 0; i < repeticionesValores.length; i++) {
                const reps = repeticionesValores[i];
                const col = document.createElement('div');
                col.className = 'flex flex-col-reverse items-center w-12';
                // Solo muestra el número (no barra):
                const val = document.createElement('span');
                val.className = 'text-xs text-[#078838] font-bold text-center';
                val.textContent = reps > 0 ? reps + " rep" : "";
                col.appendChild(val);
                graficaRepeticiones.appendChild(col);
            }
        }

        // --- RESUMEN DE PROGRESO ---
        const diasActivosConsecutivosElem = document.getElementById('diasActivosConsecutivos');
        const cambioDiasElem = document.getElementById('cambioDias');
        const totalMinutosElem = document.getElementById('totalMinutos');
        const cambioTotalElem = document.getElementById('cambioTotal');
        const logrosContainer = document.getElementById('logrosContainer');

        function actualizarDatosProgreso() {
            const actividades = getData('actividades');
            renderGrafica(actividades, modoGrafica.value);

            // Días consecutivos, minutos y repeticiones totales
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
            const totalMinutosAcumulados = actividades.reduce((sum, act) => sum + (act.duracion || 0), 0);
            if (totalMinutosElem) totalMinutosElem.textContent = totalMinutosAcumulados;
            if (cambioTotalElem) {
                if (actividades.length > 0) {
                    const lastActivityDuration = actividades[actividades.length -1].duracion || 0;
                    cambioTotalElem.textContent = `+${lastActivityDuration}`;
                    cambioTotalElem.className = 'text-[#078838] text-base font-medium leading-normal';
                } else {
                    cambioTotalElem.textContent = '';
                }
            }
            const totalRepeticiones = actividades.reduce((sum, act) => sum + (act.repeticiones || 0), 0);
            if (totalRepeticionesElem) totalRepeticionesElem.textContent = totalRepeticiones;
            if (cambioRepsElem) {
                if (actividades.length > 0) {
                    const lastActivityReps = actividades[actividades.length -1].repeticiones || 0;
                    cambioRepsElem.textContent = lastActivityReps > 0 ? `+${lastActivityReps}` : '';
                    cambioRepsElem.className = 'text-[#078838] text-base font-medium leading-normal';
                } else {
                    cambioRepsElem.textContent = '';
                }
            }
            // Logros igual que antes...
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
        actualizarDatosProgreso();

        // --- CALENDARIO MODERNO ---
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
                let minutos = actividades.reduce((sum, a) => sum + (a.duracion || 0), 0);
                let repeticiones = actividades.reduce((sum, a) => sum + (a.repeticiones || 0), 0);
                let lista = actividades.map(a =>
                  `<li class="mb-1"><span class="font-semibold">${a.actividad}</span> - ${a.duracion} min. ${a.repeticiones ? `, ${a.repeticiones} reps` : ''} (esfuerzo ${a.esfuerzo})</li>`
                ).join('');
                resumenInfo.innerHTML =
                  `<p class="mb-2"><span class="font-bold text-[#1993e5]">${minutos}</span> minutos en total.</p>
                   <p class="mb-2"><span class="font-bold text-[#078838]">${repeticiones}</span> repeticiones en total.</p>
                  <ul class="list-disc pl-5">${lista}</ul>`;
                modalResumenDia.classList.remove('hidden');
            }
            renderCalendar();
        }
        pintarCalendarioEntrenamientos();
    }

    // --- Utilidades ---
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
});