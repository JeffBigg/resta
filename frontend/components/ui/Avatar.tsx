export const Avatar = ({ nombre }: { nombre: string }) => (
    <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200 shadow-sm">
        {nombre.charAt(0).toUpperCase()}
    </div>
);