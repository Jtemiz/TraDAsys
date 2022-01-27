import copy
import math
import traceback
import datetime
from ast import literal_eval
from datetime import datetime as datetimeMethod
import werkzeug
from flask import Flask, Response, jsonify, request
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource, reqparse
from werkzeug import datastructures
import collections
import logging
import BackendFilter

app = Flask(__name__)
VALUES = []
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
api = Api(app)

uploadedFiles = []
storedRecords = []
flatStoredRecords = []


logging.basicConfig(filename=app.root_path + '/backend.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s: %(message)s')


class ImportApi(Resource):
  """
  class ImportApi is used for importing the dataset of the user into the System
  file is sent from Angular with form-data
  """

  def post(self):
    """
    POST for receiving data and sorting values into a dict-array
    INPUT: file: form-data
    RETURN: confirm-message
    """
    global uploadedFiles
    try:
      parser = reqparse.RequestParser()
      parser.add_argument('files[]',
                          type=werkzeug.datastructures.FileStorage,
                          location='files', action='append')
      args = parser.parse_args()
      files = args['files[]']
      for file in files:
        fileString = file.read().decode('utf8')
        uploadedFiles.append(fileString)
        parseFileToRecord(fileString)
      return str(len(uploadedFiles)) + ' Records mit je durchschnittlich ' + str(
        int(len(flatStoredRecords) / len(uploadedFiles))) + ' Frames hochgeladen', 200
    except Exception as ex:
      logging.error("ImportApi.post(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Fehler im Datei-Import. Bitte erneut probieren', 500

  # delete method used for clearing stored values.
  # Is called in Frontend, when user loads up new files.
  def delete(self):
    global storedRecords
    global flatStoredRecords
    global uploadedFiles
    uploadedFiles.clear()
    storedRecords.clear()
    flatStoredRecords.clear()
    return 'cleared', 200


class BarChartApi(Resource):
  """
  Class: BarChartApi is used for all backend interactions depending on the Bar Chart Visualization
  Contains: GET for create Array for BarChart
  """

  def get(self):
    """
    get returns an int[][] with 24 entries (one for each hour)
    Counts the number of Bodies in a Frame and returns them to the frontend
    """
    if len(storedRecords) == 0:
      return 'Keine Daten gespeichert', 409
    else:
      try:
        bcArray = [0] * 24
        for record in storedRecords:
          bodyAmount = collections.Counter(e['bodyIndex'] for e in record)
          bcArray[record[0]['time'].hour] += len(bodyAmount)
        return bcArray, 200
      except Exception as ex:
        logging.error("BarChartApi.get(): " + str(ex) + "\n" + traceback.format_exc())
        return 'Fehler im Erstellen des BarCharts. Bitte erneut probieren', 500


class HeatMapApi(Resource):
  """
  class HeatMapApi is used for handling the HeatMap-Data
  contains PUT
  """

  def put(self):
    """
    PUT-method for receiving the Array of visualization data.
    :input: Parser has parameters xaxis and yaxis; StoredRecords are the available data that should be visualized
    to get the amount of vertical and horizontal pixels.
    :return: the hmArray is a Array of Array of int, which represents the Heatmap-visualization of the StoredRecords
    """
    if len(storedRecords) == 0:
      return 'Keine Daten gespeichert', 409
    else:
      try:
        # fist get the amount of pixels
        parser = reqparse.RequestParser()
        parser.add_argument('xaxis', type=int, required=True)
        parser.add_argument('yaxis', type=int, required=True)
        args = parser.parse_args()
        # initialize the return-array. Size of the Array depends on the amount of pixels
        hmArray = [[0 for i in range(args['yaxis'])] for j in range(args['yaxis'])]
        # get all the max an min values of x and yAxis to get the size of each pixel
        maxX = max(flatStoredRecords, key=lambda x: x['xAxis'])['xAxis']
        maxZ = max(flatStoredRecords, key=lambda x: x['zAxis'])['zAxis']
        minX = min(flatStoredRecords, key=lambda x: x['xAxis'])['xAxis']
        minZ = min(flatStoredRecords, key=lambda x: x['zAxis'])['zAxis']
        xAreaSize = (abs(maxX) + abs(minX)) / args['xaxis']
        zAreaSize = (abs(maxZ) + abs(minZ)) / args['yaxis']
        # look for the negative area of the visualization to avoid OutOfBounds-Exceptions
        negAreaX = math.floor(args['xaxis'] * abs(minX) / (abs(maxX) + abs(minX)))
        negAreaZ = math.floor((args['yaxis'] * abs(minZ) / (abs(maxZ) + abs(minZ))))
        # iterate through all values, check in which array element the position should be assigned to.
        # add 1 to those element.
        for record in storedRecords:
          for frame in record:
            idxX = math.floor(frame['xAxis'] / xAreaSize) + negAreaX
            idxZ = math.floor(frame['zAxis'] / zAreaSize) + negAreaZ
            hmArray[idxX][idxZ] += 1
        for row in range(len(hmArray)):
          for col in range(len(hmArray[row])):
            if hmArray[row][col] == 0:
              hmArray[row][col] = None
        return {'minX': minX, 'maxX': maxX, 'minY': minZ, 'maxY': maxZ, 'dataSet': hmArray}
      except Exception as ex:
        return ex, 500


class HeatMapMovementApi(Resource):
  def put(self):
    if len(storedRecords) == 0:
      return 'Keine Daten gespeichert', 409
    else:
      try:
        parser = reqparse.RequestParser()
        parser.add_argument('xaxis', type=int, required=True)
        parser.add_argument('yaxis', type=int, required=True)
        args = parser.parse_args()
        # initialize the return-array. Size of the Array depends on the amount of pixels
        hmArray = [[0 for i in range(args['yaxis'])] for j in range(args['yaxis'])]
        # get all the max an min values of x and yAxis to get the size of each pixel
        maxX = max(flatStoredRecords, key=lambda x: x['xAxis'])['xAxis']
        maxZ = max(flatStoredRecords, key=lambda x: x['zAxis'])['zAxis']
        minX = min(flatStoredRecords, key=lambda x: x['xAxis'])['xAxis']
        minZ = min(flatStoredRecords, key=lambda x: x['zAxis'])['zAxis']
        xAreaSize = (abs(maxX) + abs(minX)) / args['xaxis']
        zAreaSize = (abs(maxZ) + abs(minZ)) / args['yaxis']
        # look for the negative area of the visualization to avoid OutOfBounds-Exceptions
        negAreaX = math.floor(args['xaxis'] * abs(minX) / (abs(maxX) + abs(minX)))
        negAreaZ = math.floor((args['yaxis'] * abs(minZ) / (abs(maxZ) + abs(minZ))))
        # iterate through all values, check in which array element the position should be assigned to.
        # add 1 to those element.
        currentBodyAmount = 0
        for record in storedRecords:
          maxBodyIndex = max(record, key=lambda x: x['bodyIndex'])['bodyIndex']
          colorArray = list(range(currentBodyAmount, currentBodyAmount + maxBodyIndex + 1))
          currentBodyAmount += maxBodyIndex
          for frame in record:
            idxX = math.floor(frame['xAxis'] / xAreaSize) + negAreaX
            idxZ = math.floor(frame['zAxis'] / zAreaSize) + negAreaZ
            hmArray[idxX][idxZ] = colorArray[frame['bodyIndex']]
        for row in range(len(hmArray)):
          for col in range(len(hmArray[row])):
            if hmArray[row][col] == 0:
              hmArray[row][col] = None
        return {'minX': minX, 'maxX': maxX, 'minY': minZ, 'maxY': maxZ, 'dataSet': hmArray}
      except Exception as ex:
        print(ex, traceback.format_exc())
        return ex, 500


class FilterApi(Resource):
  """
  FilterApi-Class represents the filter modification place.
  It is used in the FilterComponent to get all filter on the initialization and for changing the current filters
  """

  def get(self):
    """
    get for receiving the current filters in the backend.
    is called, when frontend initialize the filterComponent
    returns the current filters
    """
    try:
      ngFilter = copy.deepcopy(BackendFilter.filterConfig)
      ngFilter['from'] = str(BackendFilter.filterConfig['from'])
      ngFilter['to'] = str(BackendFilter.filterConfig['to'])
      return ngFilter, 200
    except Exception as ex:
      return "Fehler im Laden der aktuellen Filter.", 500

  def put(self):
    """
    put for changing the current filters in the backend.
    is called, user triggers "save" button in the FilterComponent
    """
    try:
      global storedRecords
      global flatStoredRecords
      parser = reqparse.RequestParser()
      parser.add_argument('filter', type=str, required=True)
      args = parser.parse_args()
      tmpFilter = literal_eval(args['filter'])
      BackendFilter.filterConfig = tmpFilter
      BackendFilter.filterConfig['from'] = datetime.datetime.strptime(tmpFilter['from'], '%H:%M:%S').time()
      BackendFilter.filterConfig['to'] = datetime.datetime.strptime(tmpFilter['to'], '%H:%M:%S').time()
      storedRecords = []
      flatStoredRecords = []
      for file in uploadedFiles:
        parseFileToRecord(file)
      return {'uploadedFilesAmount': len(uploadedFiles), 'recordAmount': len(storedRecords),
              'frameAmount': len(flatStoredRecords)}, 200
    except Exception as ex:
      logging.error("FilterApi.put(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Fehler in der Filterübertragung', 500


def parseFileToRecord(fileString):
  """
  method parses a file into a record (array of frames)
  :param fileString: String --> String of the txt file
  :return: None -> Saves Record directly into storedRecords & flatStoredRecords
  """
  global storedRecords
  global flatStoredRecords
  frames = fileString.split('\r\n')
  tmp = []
  if len(frames) < BackendFilter.filterConfig['minFrameAmount']:
    return
  # iterate through array of Frames and split each Frame on '###' to get 19 single values
  for frame in frames:
    # split text-file on each linebreak --> Array of Frames
    valArray = frame.split(' ### ')
    if len(valArray) > 1:
      frameDict = {
        'time': datetimeMethod.strptime(valArray[0][:-7], '%Y-%m-%d %H:%M:%S.%f'),
        'frameWorkBodyTrackingId': valArray[1],
        'recordId': valArray[2],
        'bodyIndex': int(valArray[3]),
        'bodyAmount': int(valArray[4]),
        'Happy': valArray[5],
        'Engaged': valArray[6],
        'Glasses': valArray[7],
        'LeftEyeClosed': valArray[8],
        'RightEyeClosed': valArray[9],
        'MouthOpen': valArray[10],
        'MouthMoved': valArray[11],
        'LookingAway': valArray[12],
        'HandLeftState': valArray[13],
        'HandRightState': valArray[14],
        'xAxis': float(valArray[15].replace(',', '.')),
        'yAxis': float(valArray[16].replace(',', '.')),
        'zAxis': float(valArray[17].replace(',', '.')),
        'Distance': float(valArray[18].replace(',', '.')),
      }
      # append the dict to the temporary variable tmp
      tmp.append(frameDict)
  # when all frames of the record are appended temporary record tmp: filter record
  filteredRecord = BackendFilter.filterRecord(tmp)
  # if result of filtering is no empty array: append it to the global storedRecords
  if len(filteredRecord) > 0:
    storedRecords.append(filteredRecord)
    flatStoredRecords.extend(filteredRecord)
  return


api.add_resource(ImportApi, '/upload')
api.add_resource(HeatMapApi, '/heatmap')
api.add_resource(HeatMapMovementApi, '/heatmapmovement')
api.add_resource(FilterApi, '/filter')
api.add_resource(BarChartApi, '/barchart')

if __name__ == '__main__':
  app.run(debug=True, host='127.0.0.1', port=5000)
