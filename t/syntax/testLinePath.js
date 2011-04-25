{
  name   : "minimal linepath",
  data   : "sheet mySheet { linepath myLinePath1; }",
  result : "sheet mySheet {\n  linepath myLinePath1;\n}\n"
},
{
  name   : "with moves",
  data   : "sheet mySheet { linepath myLinePath1 +moves=\"10,15;20,25\"; }",
  result : "sheet mySheet {\n  linepath myLinePath1 +moves=\"10,15;20,25\";\n}\n"
}
