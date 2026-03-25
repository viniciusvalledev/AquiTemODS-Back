import Usuario from "./Usuario.entity";
import Projeto from "./Projeto.entity";
import Avaliacao from "./Avaliacao.entity";
import ImagemProjeto from "./ImagemProjeto.entity";
import SustentaiAcao from "./SustentaiAcao.entity";
import SustentAi from "./SustentAi.entity";
import SustentaiAcaoBloco from "./SustentaiAcaoBloco.entity";
import SustentaiBloco from "./SustentaiBloco.entity";
import SustentaiHeader from "./SustentaiHeader.entity";
import SustentaiPessoa from "./SustentaiPessoa.entity";

Usuario.hasMany(Avaliacao, { foreignKey: "usuarioId", as: "avaliacoes" });
Avaliacao.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

Projeto.hasMany(Avaliacao, {
  foreignKey: "projetoId",
  as: "avaliacoes",
});
Avaliacao.belongsTo(Projeto, {
  foreignKey: "projetoId",
  as: "projeto",
});

Projeto.hasMany(ImagemProjeto, {
  foreignKey: "projetoId",
  as: "projetoImg",
});
ImagemProjeto.belongsTo(Projeto, { foreignKey: "projetoId" });

// Associações relacionadas ao módulo Sustentai
SustentaiAcao.hasMany(SustentaiAcaoBloco, {
  foreignKey: "acaoId",
  as: "blocos",
  onDelete: "CASCADE",
});

SustentaiAcaoBloco.belongsTo(SustentaiAcao, {
  foreignKey: {
    name: "acaoId",
    allowNull: false, // mantém obrigatório
  },
  as: "acao",
  onDelete: "CASCADE",
});

export {
  Usuario,
  Projeto,
  Avaliacao,
  ImagemProjeto,
  SustentaiAcao,
  SustentAi,
  SustentaiAcaoBloco,
  SustentaiBloco,
  SustentaiHeader,
  SustentaiPessoa,
};
