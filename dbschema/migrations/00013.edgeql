CREATE MIGRATION m1eoffkbd2ygr3lcm2hibh7v6zcinr5ocjo65y37ymbj54fpdylopq
    ONTO m1way6nq4hctudcme443hc7yzry4yeyz2qmeim3msmekbpxxar4oza
{
  ALTER TYPE default::Source {
      CREATE PROPERTY provider_meta -> std::json;
      CREATE PROPERTY thumbnail -> std::str;
      CREATE PROPERTY title -> std::str;
  };
};
