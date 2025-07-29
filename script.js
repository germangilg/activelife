document.addEventListener('DOMContentLoaded', function() {
    // ... (otras páginas)

    // --- PROGRESO ---
    if (document.body.classList.contains('page-progreso')) {
        let periodoOffset = 0; // 0 = periodo actual, 1 = anterior, etc.
        const graficaProgreso = document.getElementById('graficaProgreso');
        const modoGrafica = document.getElementById('modoGrafica');
        const btnPeriodoAnterior = document.getElementById('btnPeriodoAnterior');
        const btnPeriodoSiguiente = document.getElementById('btnPeriodoSiguiente');
        const etiquetaPeriodo = document.getElementById('etiquetaPeriodo');

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

        // NUEVAS FUNCIONES: SIEMPRE DE LUNES A DOMINGO
        function getWeekMonday(date) {
            // Devuelve el lunes de la semana de la fecha dada
            const day = date.getDay();
            const diff = (day === 0 ? -6 : 1) - day;
            const monday = new Date(date);
            monday.setDate(date.getDate() + diff);
            monday.setHours(0,0,0,0);
            return monday;
        }

        function getNDaysLabelsMondayToSunday(offset) {
            // offset: 0 = semana actual, 1 = anterior, etc.
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
                  .reduce((sum, a) => sum + a.duracion, 0);
                resultado.push(minutos);
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
                  .reduce((sum, a) => sum + a.duracion, 0);
                resultado.push(minutos);
            }
            return resultado;
        }

        function renderGrafica(actividades, modo) {
            graficaProgreso.innerHTML = '';
            let valores = [], etiquetas = [], maximo = 1;
            if (modo === 'dias') {
                valores = getMinutosPorSemanaLunesADomingo(actividades, periodoOffset);
                etiquetas = getNDaysLabelsMondayToSunday(periodoOffset);
                maximo = Math.max(...valores, 30);
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
                etiquetas = getLastNWeeksLabelsConOffset(4, periodoOffset);
                maximo = Math.max(...valores, 100);
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
        }

        // --- RESUMEN DE PROGRESO Y CALENDARIO IGUAL QUE ANTES ---
        const diasActivosConsecutivosElem = document.getElementById('diasActivosConsecutivos');
        const cambioDiasElem = document.getElementById('cambioDias');
        const totalMinutosElem = document.getElementById('totalMinutos');
        const cambioTotalElem = document.getElementById('cambioTotal');
        const logrosContainer = document.getElementById('logrosContainer');

        function actualizarDatosProgreso() {
            const actividades = getData('actividades');
            renderGrafica(actividades, modoGrafica.value);

            // ... el resto de la lógica igual ...
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

        // ... calendario igual ...
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

    // ... (otras páginas)
    function getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error al leer de localStorage para', key, e);
            return [];
        }
    }
});