import pandapower as pp
from pandapower.converter.matpower import from_mpc
from app.models.power_system_results import PowerSystemResult
import os
from typing import List

class MatpowerService:
    # Constante para controlar prints de debug
    DEBUG_ENABLED = True  # Altere para False para desabilitar prints de debug
    
    def __init__(self):
        # Caminho para o diretório data no backend
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
        
        # Garantir que o diretório existe
        if not os.path.exists(self.data_dir):
            raise ValueError(f"Diretório de dados não encontrado: {self.data_dir}")
    
    def _debug_print(self, message: str):
        """Método auxiliar para prints de debug condicionais"""
        if self.DEBUG_ENABLED:
            print(f"DEBUG: {message}")
    
    def list_available_files(self) -> List[str]:
        """Lista todos os arquivos MATPOWER disponíveis"""
        try:
            # Verificar se o diretório existe
            if not os.path.exists(self.data_dir):
                raise ValueError(f"Diretório de dados não encontrado: {self.data_dir}")
                
            # Listar apenas arquivos .m
            matpower_files = [f for f in os.listdir(self.data_dir) if f.endswith('.m')]
            
            # Verificar se existem arquivos
            if not matpower_files:
                raise ValueError("Nenhum arquivo MATPOWER (.m) encontrado no diretório de dados")
                
            return matpower_files
            
        except Exception as e:
            raise ValueError(f"Erro ao listar arquivos MATPOWER: {str(e)}")

    def simulate_from_filename(self, filename: str) -> PowerSystemResult:
        """Simula um sistema a partir de um arquivo MATPOWER"""
        try:
            if not filename.endswith('.m'):
                raise ValueError(f"Modelo inválido: {filename}. Deve ter extensão .m")

            file_path = os.path.join(self.data_dir, filename)
            if not os.path.exists(file_path):
                raise ValueError(f"Modelo não encontrado: {filename}")

            if not os.path.isfile(file_path):
                raise ValueError(f"O caminho {filename} não é um modelo válido")

            # Verifica se o arquivo é legível
            try:
                with open(file_path, 'r') as f:
                    f.read(1)
            except Exception as e:
                raise ValueError(f"Erro ao ler o modelo {filename}: {str(e)}")
            
            net = from_mpc(file_path)
            return self._run_simulation(net)
        except Exception as e:
            raise ValueError(f"Erro ao simular a partir do modelo {filename}: {str(e)}")

    def simulate_from_string(self, matpower_string: str) -> PowerSystemResult:
        """Simula um sistema a partir de uma string MATPOWER"""
        import tempfile
        import warnings
        
        # Suprimir warnings específicos do pandas/pandapower
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=FutureWarning, module="pandas")
            warnings.filterwarnings("ignore", category=FutureWarning, module="pandapower")
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.m', delete=False) as tmp:
                tmp.write(matpower_string)
                tmp_path = tmp.name
            
            try:
                self._debug_print(f"Criando rede a partir do arquivo: {tmp_path}")
                net = from_mpc(tmp_path)
                self._debug_print(f"Rede criada com sucesso. Buses: {len(net.bus)}")
                return self._run_simulation(net)
            except Exception as e:
                print(f"ERROR: Erro ao criar/simular rede: {str(e)}")
                raise ValueError(f"Erro ao processar o arquivo MATPOWER: {str(e)}")
            finally:
                os.unlink(tmp_path)

    def _run_simulation(self, net: pp.pandapowerNet) -> PowerSystemResult:
        """Executa a simulação e converte os resultados"""
        import warnings
        
        try:
            # Suprimir warnings específicos do pandas/pandapower
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=FutureWarning, module="pandas")
                warnings.filterwarnings("ignore", category=FutureWarning, module="pandapower")
                
                self._debug_print("Iniciando simulação...")
                pp.runpp(net)
                self._debug_print("Simulação concluída com sucesso")
                
                # Print adicional para debug imediato no console
                self._debug_print("=== DEBUG NET VARIABLE ===")
                self._debug_print(f"Bus count: {len(net.bus)}")
                self._debug_print(f"Line count: {len(net.line) if hasattr(net, 'line') else 0}")
                self._debug_print(f"Gen count: {len(net.gen) if hasattr(net, 'gen') else 0}")
                if hasattr(net, 'res_bus'):
                    self._debug_print(f"Bus results columns: {list(net.res_bus.columns)}")
                    self._debug_print("Bus results sample:")
                    self._debug_print(str(net.res_bus.head()))
                self._debug_print("=========================")
                
        except Exception as e:
            print(f"ERROR: Erro durante simulação: {str(e)}")
            raise ValueError(f"Erro na simulação do sistema: {str(e)}")
        
        return self._convert_results(net)

    def _convert_results(self, net: pp.pandapowerNet) -> PowerSystemResult:
        """Converte os resultados do pandapower para nosso formato"""
        from app.models.power_system_results import (
            BusResult, LineResult, LoadResult, 
            GeneratorResult, ExtGridResult, PowerSystemResult
        )
        
        self._debug_print("Iniciando conversão de resultados...")
        self._debug_print(f"Colunas disponíveis em res_bus: {list(net.res_bus.columns)}")
        
        # Converter resultados das barras
        buses = []
        for i in range(len(net.bus)):
            try:
                bus_result = BusResult(
                    bus_id=int(i),
                    vm_pu=float(net.res_bus.vm_pu.iloc[i]),
                    va_degree=float(net.res_bus.va_degree.iloc[i]) if 'va_degree' in net.res_bus.columns else 0.0,
                    p_mw=float(net.res_bus.p_mw.iloc[i]) if 'p_mw' in net.res_bus.columns else 0.0,
                    q_mvar=float(net.res_bus.q_mvar.iloc[i]) if 'q_mvar' in net.res_bus.columns else 0.0
                )
                buses.append(bus_result)
            except Exception as e:
                print(f"ERROR: Erro ao converter bus {i}: {str(e)}")
                raise
        
        # Converter resultados das linhas
        lines = []
        if hasattr(net, 'line') and len(net.line) > 0:
            self._debug_print(f"Colunas disponíveis em res_line: {list(net.res_line.columns)}")
            for i in range(len(net.line)):
                try:
                    line_result = LineResult(
                        from_bus=int(net.line.from_bus.iloc[i]),
                        to_bus=int(net.line.to_bus.iloc[i]),
                        p_from_mw=float(net.res_line.p_from_mw.iloc[i]) if 'p_from_mw' in net.res_line.columns else 0.0,
                        q_from_mvar=float(net.res_line.q_from_mvar.iloc[i]) if 'q_from_mvar' in net.res_line.columns else 0.0,
                        p_to_mw=float(net.res_line.p_to_mw.iloc[i]) if 'p_to_mw' in net.res_line.columns else 0.0,
                        q_to_mvar=float(net.res_line.q_to_mvar.iloc[i]) if 'q_to_mvar' in net.res_line.columns else 0.0,
                        pl_mw=float(net.res_line.pl_mw.iloc[i]) if 'pl_mw' in net.res_line.columns else 0.0,
                        ql_mvar=float(net.res_line.ql_mvar.iloc[i]) if 'ql_mvar' in net.res_line.columns else 0.0,
                        i_from_ka=float(net.res_line.i_from_ka.iloc[i]) if 'i_from_ka' in net.res_line.columns else 0.0,
                        i_to_ka=float(net.res_line.i_to_ka.iloc[i]) if 'i_to_ka' in net.res_line.columns else 0.0,
                        i_ka=float(net.res_line.i_ka.iloc[i]) if 'i_ka' in net.res_line.columns else 0.0,
                        vm_from_pu=float(net.res_line.vm_from_pu.iloc[i]) if 'vm_from_pu' in net.res_line.columns else 0.0,
                        va_from_degree=float(net.res_line.va_from_degree.iloc[i]) if 'va_from_degree' in net.res_line.columns else 0.0,
                        vm_to_pu=float(net.res_line.vm_to_pu.iloc[i]) if 'vm_to_pu' in net.res_line.columns else 0.0,
                        va_to_degree=float(net.res_line.va_to_degree.iloc[i]) if 'va_to_degree' in net.res_line.columns else 0.0,
                        loading_percent=float(net.res_line.loading_percent.iloc[i]) if 'loading_percent' in net.res_line.columns else 0.0,
                        in_service=bool(net.line.in_service.iloc[i])
                    )
                    lines.append(line_result)
                except Exception as e:
                    print(f"ERROR: Erro ao converter line {i}: {str(e)}")
                    raise
        
        # Converter resultados das cargas
        loads = []
        if hasattr(net, 'load') and len(net.load) > 0:
            self._debug_print(f"Colunas disponíveis em res_load: {list(net.res_load.columns)}")
            for i in range(len(net.load)):
                try:
                    load_result = LoadResult(
                        bus_id=int(net.load.bus.iloc[i]),
                        p_mw=float(net.res_load.p_mw.iloc[i]) if 'p_mw' in net.res_load.columns else 0.0,
                        q_mvar=float(net.res_load.q_mvar.iloc[i]) if 'q_mvar' in net.res_load.columns else 0.0,
                        scaling=float(net.load.scaling.iloc[i]) if 'scaling' in net.load.columns else 1.0
                    )
                    loads.append(load_result)
                except Exception as e:
                    print(f"ERROR: Erro ao converter load {i}: {str(e)}")
                    raise
        
        # Converter resultados dos geradores
        generators = []
        if hasattr(net, 'gen') and len(net.gen) > 0:
            self._debug_print(f"Colunas disponíveis em res_gen: {list(net.res_gen.columns)}")
            for i in range(len(net.gen)):
                try:
                    gen_result = GeneratorResult(
                        bus_id=int(net.gen.bus.iloc[i]),
                        p_mw=float(net.res_gen.p_mw.iloc[i]) if 'p_mw' in net.res_gen.columns else 0.0,
                        q_mvar=float(net.res_gen.q_mvar.iloc[i]) if 'q_mvar' in net.res_gen.columns else 0.0,
                        vm_pu=float(net.gen.vm_pu.iloc[i]) if 'vm_pu' in net.gen.columns else 1.0,
                        in_service=bool(net.gen.in_service.iloc[i])
                    )
                    generators.append(gen_result)
                except Exception as e:
                    print(f"ERROR: Erro ao converter gen {i}: {str(e)}")
                    raise
        
        # Converter resultado da barra slack
        ext_grid = None
        if hasattr(net, 'ext_grid') and len(net.ext_grid) > 0:
            self._debug_print(f"Colunas disponíveis em res_ext_grid: {list(net.res_ext_grid.columns)}")
            try:
                ext_grid = ExtGridResult(
                    bus_id=int(net.ext_grid.bus.iloc[0]),
                    p_mw=float(net.res_ext_grid.p_mw.iloc[0]) if 'p_mw' in net.res_ext_grid.columns else 0.0,
                    q_mvar=float(net.res_ext_grid.q_mvar.iloc[0]) if 'q_mvar' in net.res_ext_grid.columns else 0.0
                )
            except Exception as e:
                print(f"ERROR: Erro ao converter ext_grid: {str(e)}")
                raise
        
        self._debug_print("Conversão de resultados concluída com sucesso")
        
        # Calcular capacidade total dos geradores (P_max e Q_max)
        gen_capacity_p = 0.0
        gen_capacity_qmin = 0.0
        gen_capacity_qmax = 0.0

        if hasattr(net, 'gen') and len(net.gen) > 0:
            self._debug_print(f"Colunas disponíveis em gen: {list(net.gen.columns)}")

            # Usar métodos do pandas para somar diretamente (mais eficiente)
            if 'max_p_mw' in net.gen.columns:
                gen_capacity_p = float(net.gen.max_p_mw.sum())
                self._debug_print(f"P_max total encontrado: {gen_capacity_p} MW")

            if 'min_q_mvar' in net.gen.columns:
                gen_capacity_qmin = float(net.gen.min_q_mvar.sum())
                self._debug_print(f"Q_min total encontrado: {gen_capacity_qmin} MVAr")

            if 'max_q_mvar' in net.gen.columns:
                gen_capacity_qmax = float(net.gen.max_q_mvar.sum())
                self._debug_print(f"Q_max total encontrado: {gen_capacity_qmax} MVAr")

            self._debug_print(f"Capacidade total dos geradores: P={gen_capacity_p} MW, Qmin={gen_capacity_qmin} MVAr, Qmax={gen_capacity_qmax} MVAr")

        # Incluir ext_grid na capacidade se existir
        if hasattr(net, 'ext_grid') and len(net.ext_grid) > 0:
            self._debug_print(f"Colunas disponíveis em ext_grid: {list(net.ext_grid.columns)}")
            gen_capacity_p += net.ext_grid['max_p_mw'].sum() if 'max_p_mw' in net.ext_grid.columns else 0.0
            gen_capacity_qmin += net.ext_grid['min_q_mvar'].sum() if 'min_q_mvar' in net.ext_grid.columns else 0.0
            gen_capacity_qmax += net.ext_grid['max_q_mvar'].sum() if 'max_q_mvar' in net.ext_grid.columns else 0.0
            self._debug_print(f"Adicionando capacidade da ext_grid: P={net.ext_grid['max_p_mw'].sum()} MW, Q={net.ext_grid['max_q_mvar'].sum()} MVAr")

        # Calcular carga total ativa e reativa do sistema
        load_system_p = 0.0
        load_system_q = 0.0
        if hasattr(net, 'load') and len(net.load) > 0:
            load_system_p = float(net.load.p_mw.sum())
            load_system_q = float(net.load.q_mvar.sum())

        self._debug_print(f"Capacidade total dos geradores: P={gen_capacity_p} MW, Qmin={gen_capacity_qmin} MVAr, Qmax={gen_capacity_qmax} MVAr")
        self._debug_print(f"Carga total do sistema: P={load_system_p} MW, Q={load_system_q} MVAr")
        
        return PowerSystemResult(
            buses=buses,
            lines=lines,
            loads=loads,
            generators=generators,
            ext_grid=ext_grid,
            genCapacityP=gen_capacity_p,
            genCapacityQmin=gen_capacity_qmin,
            genCapacityQmax=gen_capacity_qmax,
            loadSystemP=load_system_p,
            loadSystemQ=load_system_q
        )