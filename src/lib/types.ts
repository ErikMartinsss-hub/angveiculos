export type Vehicle = {
  id: string;
  created_at: string;
  categoria: "carro" | "moto";
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  preco: number;
  combustivel: string;
  cor: string;
  portas: number;
  cambio: string;
  carroceria: string;
  placa: string;
  opcionais: string[];
  descricao: string;
  fotos: string[];
  destaque: boolean;
  status: "disponivel" | "vendido" | "reservado";
};

export type VehicleFormData = Omit<
  Vehicle,
  "id" | "created_at" | "fotos"
> & {
  fotos: File[];
};

export type Lead = {
  id: string;
  created_at: string;
  nome: string;
  telefone: string;
  email: string;
  observacao: string;
};

export type LeadView = {
  id: string;
  created_at: string;
  lead_id: string;
  vehicle_id: string;
  vehicle_info: string;
};

export type Favorite = {
  id: string;
  created_at: string;
  user_id: string;
  vehicle_id: string;
};

export type Visit = {
  id: string;
  created_at: string;
  user_id: string;
  vehicle_id: string;
  nome: string;
  telefone: string;
  data_visita: string;
  horario: string;
  status: "pendente" | "confirmado" | "cancelado";
};
