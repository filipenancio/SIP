function mpc = case4p
% Caso teste - Sistemas Eletricos de Potencia -

mpc.version = '2';

mpc.baseMVA = 100;

% Dados de Barras
% Barra Tipo_barra Pd Qd Gs Bs Area |V| teta baseKV zone Vmax Vmin

mpc.bus = [
1 1  40  30  0 0 1 1 0 230 1 1.1 0.9;
2 2  20 105  0 0 1 1 0 230 1 1.1 0.9;
3 1  30 125  0 0 1 1 0 230 1 1.1 0.9;
4 3  0  50  0 0 1 1 0 230 1 1.1 0.9;
];

% Dados de geradores
% Barra Pg Qg Qmax Qmin Vg(FPO) MBase status (on/off) Pmax
mpc.gen = [
1    0   0  30    -30   1 100 1 500 0 0 0 0;
2   40   0 105   -105 1 100 1 300 0 0 0 0;
3    0   0 390   -390   1 100 1 300 0 0 0 0;
4    0   0 150   -150   1 100 1 318 0 0 0 0;
];

% Dados de linhas
% De Para R X B ratea rateb ratec ratio Tap status DeltaTETAmin DeltaTETAmax

mpc.branch = [
1 2 0.01008 0.1 0.0  0   0   0  0 0 1 -360 360;
1 3 0.00744 0.2 0.0  0   0   0  0 0 1 -360 360;
2 4 0.00744 0.4 0.0  0   0   0  0 0 1 -360 360;
3 4 0.01272 0.2 0.0  0   0   0  0 0 1 -360 360;
];
