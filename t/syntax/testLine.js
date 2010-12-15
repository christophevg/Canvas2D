{
	name   : "minimal line",
	data   : "sheet mySheet { line myLine1; }",
	result : "sheet mySheet {\n  line myLine1;\n}\n"
},
{
	name   : "geo property",
	data   : "sheet mySheet { line myLine1 +geo=\"10x20\"; }",
	result : "sheet mySheet {\n  line myLine1 +geo=\"10x20\";\n}\n"
},
{
	name   : "color property",
	data   : "sheet mySheet { line myLine1 +color=\"red\"; }",
	result : "sheet mySheet {\n  line myLine1 +color=\"red\";\n}\n"
},
{
	name   : "lineWidth property",
	data   : "sheet mySheet { line myLine1 +lineWidth=10; }",
	result : "sheet mySheet {\n  line myLine1 +lineWidth=10;\n}\n"
},
{
	name   : "lineStyle property (dashed)",
	data   : "sheet mySheet { line myLine1 +lineStyle=\"dashed\"; }",
	result : "sheet mySheet {\n  line myLine1 +lineStyle=\"dashed\";\n}\n"
},
{
	name   : "lineStyle property (none)",
	data   : "sheet mySheet { line myLine1 +lineStyle=\"none\"; }",
	result : "sheet mySheet {\n  line myLine1 +lineStyle=\"none\";\n}\n"
},
{
	name   : "lineStyle property (solid/default)",
	data   : "sheet mySheet { line myLine1 +lineStyle=\"solid\"; }",
	result : "sheet mySheet {\n  line myLine1;\n}\n"
},
{
	name   : "lineStyle property (bad value)",
	data   : "sheet mySheet { line myLine1 +lineStyle=\"wrong\"; }",
	result : "sheet mySheet {\n  line myLine1;\n}\n"
}