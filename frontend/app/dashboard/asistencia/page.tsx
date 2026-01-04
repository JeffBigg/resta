'use client';

// Importamos el componente "grueso" desde la carpeta features
import AttendanceView from '@/components/features/attendance/AttendanceView';

export default function Page() {
    return (
        <div className="w-full h-full">
            {/* Aquí renderizamos toda la lógica */}
            <AttendanceView />
        </div>
    );
}