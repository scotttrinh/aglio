CREATE MIGRATION m17qsdwd5buir2lqqb6uwbxtub5jwetfkuxp7zyhyupe3fibl237la
    ONTO m1xzwqep65ajwemttrdh6ke2kmspiu4r6xau4ovdrpaxfcaavbhrkq
{
  ALTER TYPE default::User {
      ALTER PROPERTY email {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
