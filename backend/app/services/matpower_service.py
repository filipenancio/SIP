import pandapower as pp
from pandapower.converter.matpower import from_mpc
from app.models.power_system_results import PowerSystemResult
import os
from typing import List

class MatpowerService:
    def __init__(self):
        # Caminho para o diretório data no backend
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
        
        # Garantir que o diretório existe
        if not os.path.exists(self.data_dir):
            raise ValueError(f"Diretório de dados não encontrado: {self.data_dir}")
    
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
        with tempfile.NamedTemporaryFile(mode='w', suffix='.m', delete=False) as tmp:
            tmp.write(matpower_string)
            tmp_path = tmp.name
        
        try:
            net = from_mpc(tmp_path)
            return self._run_simulation(net)
        finally:
            os.unlink(tmp_path)

    def _run_simulation(self, net: pp.pandapowerNet) -> PowerSystemResult:
        """Executa a simulação e converte os resultados"""
        pp.runpp(net)
        return self._convert_results(net)

    def _convert_results(self, net: pp.pandapowerNet) -> PowerSystemResult:
        """Converte os resultados do pandapower para nosso formato"""
        from app.models.power_system_results import (
            BusResult, LineResult, LoadResult, 
            GeneratorResult, ExtGridResult, PowerSystemResult
        )
        
        # Converter resultados das barras
        buses = [
            BusResult(
                bus_id=int(i),
                vm_pu=float(net.res_bus.vm_pu[i]),
                va_degree=float(net.res_bus.va_degree[i]),
                p_mw=float(net.res_bus.p_mw[i]),
                q_mvar=float(net.res_bus.q_mvar[i])
            )
            for i in range(len(net.bus))
        ]
        
        # Converter resultados das linhas
        lines = [
            LineResult(
                from_bus=int(net.line.from_bus[i]),
                to_bus=int(net.line.to_bus[i]),
                p_from_mw=float(net.res_line.p_from_mw[i]),
                q_from_mvar=float(net.res_line.q_from_mvar[i]),
                p_to_mw=float(net.res_line.p_to_mw[i]),
                q_to_mvar=float(net.res_line.q_to_mvar[i]),
                pl_mw=float(net.res_line.pl_mw[i]),
                ql_mvar=float(net.res_line.ql_mvar[i]),
                i_ka=float(net.res_line.i_ka[i]),
                loading_percent=float(net.res_line.loading_percent[i]),
                in_service=bool(net.line.in_service[i])
            )
            for i in range(len(net.line))
        ]
        
        # Converter resultados das cargas
        loads = [
            LoadResult(
                bus_id=int(net.load.bus[i]),
                p_mw=float(net.res_load.p_mw[i]),
                q_mvar=float(net.res_load.q_mvar[i]),
                scaling=float(net.load.scaling[i])
            )
            for i in range(len(net.load))
        ] if len(net.load) > 0 else []
        
        # Converter resultados dos geradores
        generators = [
            GeneratorResult(
                bus_id=int(net.gen.bus[i]),
                p_mw=float(net.res_gen.p_mw[i]),
                q_mvar=float(net.res_gen.q_mvar[i]),
                vm_pu=float(net.gen.vm_pu[i]),
                in_service=bool(net.gen.in_service[i])
            )
            for i in range(len(net.gen))
        ] if len(net.gen) > 0 else []
        
        # Converter resultado da barra slack
        ext_grid = ExtGridResult(
            bus_id=int(net.ext_grid.bus[0]),
            p_mw=float(net.res_ext_grid.p_mw[0]),
            q_mvar=float(net.res_ext_grid.q_mvar[0])
        )
        
        return PowerSystemResult(
            buses=buses,
            lines=lines,
            loads=loads,
            generators=generators,
            ext_grid=ext_grid
        )