"""
 | Version 10.1.1
 | Copyright 2012 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
"""
# Modified by David Spriggs, ESRI St Louis, to include: graphics, layer visability, and dynamic legend.
# new working script
import arcpy, os, json

arcpy.env.overwriteOutput = True

#############################
### Get or set parameters
#############################

# Output to the scratch workspace
scratch = arcpy.env.scratchWorkspace
arcpy.AddMessage("  Scratch WS " + str(scratch))
if not scratch:
    scratch = r"\\geoshieldfcs\ExporttoPDF\scratchworkspace"

#Variable to specify the Layout type
Layout = arcpy.GetParameterAsText(0)
if Layout == '#' or not Layout:
    Layout = "Portrait8x11"

# Set the Map Title for the report
title = "Property Map Information"

#Specify the report data for creating property report
User_input= arcpy.GetParameterAsText(2)


#Specify the WebMap JSON as string
WebMap = arcpy.GetParameterAsText(3)

# Map and Report PDF merged for PropertyMap
MapPDF = scratch + os.sep + "MapPDF.pdf"


#############################
### start main proccess
#############################


def MakeTable():
     #Read the input parameter

    arcpy.AddMessage(User_input)

    splitUserInput = User_input.split('~') #split the data from the user with tilt
    splitAgain = splitUserInput[0].split('^') #split the user input data with upperCap

    styCenter=getSampleStyleSheet()
    styCenter.add(ParagraphStyle(name='Center', alignment=TA_CENTER,fontName='Times-Bold',fontSize=10))
    neighbourHoodInfo = splitUserInput[1].split('^')

    ##print neighbourHoodInfo
    url = '<link href="%s" color="blue">%s</link>' % (neighbourHoodInfo[1], neighbourHoodInfo[0])

    if Layout == "Landscape8x11":
        inside_Table = Table([[Paragraph(url, styCenter["Center"])]], colWidths=9.5*inch)
    elif Layout == "Portrait8x11":
        inside_Table = Table([[Paragraph(url, styCenter["Center"])]], colWidths=6*inch) #for portrait oriantation

    data = [
        ['Address', '',''],
        [splitAgain[0], '', ''],
        ['Tax Parcel ID', 'Sub or Condo', 'Building / Unit'],
        [splitAgain[1], splitAgain[2], splitAgain[3]],
        ['Tax District', 'School District', 'Use Description'],
        [splitAgain[4], splitAgain[5], splitAgain[6]],
        ['Owner Name', 'Structure Type', 'Floor Area'],
        [splitAgain[7], splitAgain[8], splitAgain[9]],
        ['Assessed Value', 'Taxable Value', 'Current Taxes'],
        [splitAgain[10], splitAgain[11], splitAgain[12]],
        ['Neighbourhood', '', ''],
        [inside_Table],
        ['Broadband Availability', '',''],
        ['Provider', '', 'Speed'],
    ]

    insertAt = len(data)
    broadBandInfo = splitUserInput[2].split("#")
    newTemp =[]
    storeNewTempValues = []
    for x in range(0, len(broadBandInfo)):
        info = broadBandInfo[x].split('$')
        temp = ['','','']
        temp[0] = info[0]
        temp[1] = ''
        temp[2] = info[1]
        data.insert(insertAt, temp)
        newTemp.insert(insertAt, temp)
    rowLength =  13 + len(newTemp)

    if Layout == "Landscape8x11":
        table_with_style = Table(data, [3.2 * inch, 3.2 * inch, 3.2 * inch])
    elif Layout == "Portrait8x11":
        table_with_style = Table(data, [2.1 * inch, 2.1 * inch, 2.1 * inch]) #for portrait oriantation


    table_with_style.setStyle(TableStyle([
        ('BOX', (0,0), (2,1), 0.25, colors.gray),
        ('ALIGN',(0,0),(2,1),'DECIMAL'),
        ('RIGHTPADDING', (0,0), (2,1), -60),
        ('RIGHTPADDING', (0,0), (0,0), -105),
        ('BACKGROUND',(0,0),(2,0),colors.gray),

        ('FONT',(0,0),(2,0),'Helvetica-Bold',10),
        ('BOX', (0,2), (2,2), 0.25, colors.gray),
        ('FONT',(0,2),(2,2),'Helvetica-Bold',10),
        ('VALIGN',(0,1),(1,1),'MIDDLE'), #this is for the second box from top & nt required
        ('TOPPADDING',(0,1),(1,1),10),
        ('GRID',(0,2),(2,9),0.25,colors.black),#editing here
        ('ALIGN',(0,2),(2,10),'CENTER'),
        ('BACKGROUND',(0,2),(2,2),colors.gray),
        ('BACKGROUND',(0,4),(3,4),colors.gray),
        ('BACKGROUND',(0,6),(5,6),colors.gray),
        ('BACKGROUND',(0,8),(7,8),colors.gray),
        ('FONT',(0,4),(2,4),'Helvetica-Bold',10),
        ('BACKGROUND',(0,10),(9,10),colors.gray),
        ('FONT',(0,6),(2,6),'Helvetica-Bold',10),
        ('BACKGROUND',(0,12),(11,12),colors.gray),
        ('FONT',(0,8),(2,8),'Helvetica-Bold',10),
        ('BOX', (0,11), (2,11),0.25, colors.gray), #box for google  str, editing here
        ('FONT',(0,10),(2,10),'Helvetica-Bold',10),
        ('ALIGN',(0,10),(2,10),'DECIMAL'),
        ('RIGHTPADDING', (0,10), (2,10), -110),
        ('FONT',(0,12),(2,12),'Helvetica-Bold',10),
        ('ALIGN',(0,12),(2,12),'DECIMAL'),
        ('RIGHTPADDING', (0,12), (2,12), -130),
        ('GRID',(0,13),(2,rowLength),0.25,colors.black),
        ('ALIGN',(0,13),(2,19),'CENTER'),
        ('FONT',(0,13),(2,13),'Helvetica-Bold',10),
    ]))

    elements.append(table_with_style)


##from reportlab.platypus.flowables import Image
from reportlab.lib.units import inch,cm,mm
from reportlab.lib.pagesizes import LETTER,landscape,A4,portrait, A2
from reportlab.platypus import SimpleDocTemplate,Paragraph,Table,TableStyle,Spacer,PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors


elements =[]
styleS = getSampleStyleSheet()
styleS.add(ParagraphStyle(name='Left', alignment=TA_LEFT,fontName='Times-Bold',fontSize=14,spaceAfter=10))
elements.append(Paragraph(title, styleS["Left"]))

MakeTable()

if Layout == "Landscape8x11":
    PDF = scratch + r"\LandscapeMap.pdf"
    doc = SimpleDocTemplate(PDF, rightMargin = 72,bottomMargin=10, topMargin=10)
    doc.pagesize = landscape(A4)
elif Layout == "Portrait8x11":
    PDF = scratch + r"\PortraitMap.pdf"
    doc = SimpleDocTemplate(PDF, rightMargin = 72,bottomMargin=10, topMargin=10)
    doc.pagesize = portrait(A4)

doc.build(elements)


if WebMap == '#' or not WebMap:
    finalPdf = PDF
    # Set output file
    arcpy.SetParameterAsText(1, PDF)
    arcpy.AddMessage("  Finished")

else:
    if Layout == "Portrait8x11":
        LayoutFormat = "A4 Portrait"
        arcpy.ExportWebMap_server(WebMap, MapPDF,"PDF", "", LayoutFormat)
    else:
        LayoutFormat = "A4 Landscape"
        arcpy.ExportWebMap_server(WebMap, MapPDF,"PDF", "", LayoutFormat)
    finalPdf = arcpy.mapping.PDFDocumentOpen(MapPDF)
    finalPdf.appendPages(PDF)
    finalPdf.saveAndClose()
    # Set output file
    arcpy.SetParameterAsText(1, MapPDF)
    arcpy.AddMessage("  Finished")


