{
  name   : "minimal arrow",
  data   : "sheet mySheet { arrow myArrow1; }",
  result : "sheet mySheet {\n  arrow myArrow1;\n}\n",
},
{
  name   : "arrowHeadWidth property",
  data   : "sheet mySheet { arrow myArrow1 +arrowHeadWidth=20; }",
  result : "sheet mySheet {\n  arrow myArrow1 +arrowHeadWidth=20;\n}\n",
},
{
  name   : "minimal arrow",
  data   : "sheet mySheet { arrow myArrow1 +arrowHeadHeight=25; }",
  result : "sheet mySheet {\n  arrow myArrow1 +arrowHeadHeight=25;\n}\n",
}
