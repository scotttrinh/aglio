CREATE MIGRATION m1wvogwh6oafg273xt5gdlul4rjhvtspkkqunuubnysmfmtahatdta
    ONTO m17cdmtnjztyd7olu6jwvghk2xxatttifscknch5zijr4qzkixg7oa
{
  CREATE TYPE default::PKCEFlow {
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY verifier: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
