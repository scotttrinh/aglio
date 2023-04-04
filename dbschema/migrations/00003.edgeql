CREATE MIGRATION m16wwakksmrwkqyp5e7xuo4hwyrlrxdjaqvgcigl6k7fldwln4622a
    ONTO m1enkuhmuuxlcc2qr3ngb4xmxe6czo2a5ezn2df7cz2ju3eyvggzgq
{
  ALTER TYPE default::User {
      CREATE MULTI LINK accounts -> default::Account;
  };
};
