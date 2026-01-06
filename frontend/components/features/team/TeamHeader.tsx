'use client';

type TabOption = 'staff' | 'riders';

interface Props {
  activeTab: TabOption;
  setActiveTab: (t: TabOption) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  isFormOpen: boolean;
  setIsFormOpen: (v: boolean) => void;
}

export default function TeamHeader({ 
  activeTab, setActiveTab, searchTerm, setSearchTerm, isFormOpen, setIsFormOpen 
}: Props) {
  return (
    <div className="space-y-6">
      {/* Top Section: Título y Controles */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        
        <div className="mb-2 xl:mb-0">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Gestión de Equipo
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Administra personal de planta y flota de reparto.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          
          {/* Tabs Selector */}
          <div className="bg-muted border border-border p-1 rounded-xl flex items-center shadow-inner transition-colors">
            <button 
              onClick={() => { setActiveTab('staff'); setIsFormOpen(false); }}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'staff' 
                ? 'bg-background text-primary shadow-sm ring-1 ring-border' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>🧑‍🍳</span> <span className="sm:inline">Personal</span>
            </button>
            <button 
              onClick={() => { setActiveTab('riders'); setIsFormOpen(false); }}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'riders' 
                ? 'bg-background text-primary shadow-sm ring-1 ring-border' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>🛵</span> <span className="sm:inline">Motorizados</span>
            </button>
          </div>

          <div className="hidden xl:block w-px h-8 bg-border mx-1"></div>

          {/* Botón Nuevo */}
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`px-5 py-2 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isFormOpen 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isFormOpen ? 'Cancelar' : (activeTab === 'staff' ? '+ Empleado' : '+ Rider')}
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">🔍</span>
        <input 
          type="text" 
          placeholder={activeTab === 'staff' ? "Buscar por nombre, apellido o rol..." : "Buscar rider..."}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}