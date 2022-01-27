from BackendParser import *


filterConfig = {
  'from': datetime.time(0, 0),
  'to': datetime.time(23, 59),
  'flyingPixDist': 0.5,
  'engagementFrom': 0,
  'engagementTo': 1,
  'DisplayGroups': -1,
  'DisplayAttributes': [-1, -1, -1],
  'minBodyAmount': 0,
  'maxBodyAmount': 6,
  'minDistance': 0,
  'maxDistance': -1,
  'minFrameAmount': 0
}

def filterRecord(record):
  """
  Main-Method in the filter process
  Method is called, when a new file has been imported or the filters have been changed
  The method runs through all specific filter methods systematically.
  For implementing a new filter append the method definition in "funcs"
  Implement the new filter method with the param record: Array of Frames that returns the filtered record
  :param: record: Dict[] --> raw unfiltered record
  :return: record: Dict[] --> filtered Record
  """
  filteredRecord = record
  funcs = [filterTime, filterFlyingPixelsInRecord, filterEngagement, filterAttributes, filterGroups, filterBodyAmount,
           filterDistance]
  for func in funcs:
    if len(filteredRecord) > 0:
      filteredRecord = func(filteredRecord)
    else:
      return []
  return filteredRecord


def filterTime(record):
  """
  Used for filter the record for time.
  If the first frame of the record is not within the Duration of global filter['from'] - filter['to']:
  empty array will be returned
  :param record
  :return record if its first frame is in the time range
  :return empty array if it isn't in the range
  """
  time = record[0]['time']
  if filterConfig['from'] < filterConfig['to']:
    if filterConfig['from'] <= time.time() <= filterConfig['to']:
      return record
  else:  # crosses midnight
    if time >= filterConfig['from'] or time.time() <= filterConfig['to']:
      return record
  return []


def filterFlyingPixelsInRecord(record):
  """
  Used for filter the record for flyingPixels.
  :param: record: Dict[] --> record that should be filtered for flyingPixels
  :return: record: Dict[] --> filteredRecord
  If the distance between 2 positions of a body are more than filter['flyingPixDist']:
  Body will be thrown out of record
  """
  # if filter is deactivated --> return the unfiltered record
  if filterConfig['flyingPixDist'] == -1:
    return record
  else:
    framesDividedInBodies = divideRecordInBodies(record)
    filteredRecord = []
    # take each body and check the positionDistances
    for body in framesDividedInBodies:
      filteredRecordOfBodyN = []
      lastFrame = None
      for frame in body:
        if lastFrame is None:
          # than it has to be the first frame, so go on
          lastFrame = frame
        elif checkDist(frame, lastFrame):
          # if check dist returns true the distances are ok
          filteredRecordOfBodyN.append(frame)
          lastFrame = frame
        else:
          # if not: The distances are to large --> So the complete body has to be thrown out of the record
          filteredRecordOfBodyN.clear()
          break
      # if the record of one body isn't empty, we can append it to the filtered Records because there where no
      # flyingPixel
      if len(filteredRecordOfBodyN) > 0:
        filteredRecord.extend(filteredRecordOfBodyN)
    return filteredRecord


def checkDist(lastFrame, frame):
  """
  Method is used for check the distance between 2 frames: :param: lastFrame: the frame before the current frame
  :param: frame: the current frame :return true if the distance of (x, z) of the last frame and (x, z) of the current
  frame is smaller than filter['flyingPixDist']
  """
  positionDistances = math.sqrt(
    math.pow(frame['xAxis'] - lastFrame['xAxis'], 2) + math.pow(frame['zAxis'] - lastFrame['zAxis'], 2))
  return positionDistances < filterConfig['flyingPixDist']


def filterEngagement(record):
  """
  Used for filter the record for engagement.
  :param: record: Dict[] --> record that should be filtered for engagement
  :return: record: Dict[] --> filteredRecord
  if the Engagement of a Body is larger than filter['engagementTo'] of smaller than filter['engagementFrom']:
  body will be thrown out of record
  """
  # if filter allows all possible values, there is no need to check
  if filterConfig['engagementFrom'] == 0 and filterConfig['engagementTo'] == 1:
    return record
  returnRecord = []
  framesDividedInBodies = divideRecordInBodies(record)
  # check engagement body by body
  for body in framesDividedInBodies:
    if len(body) > 1:
      engagedFrames = 0
      # get duration of the passengers stay
      timeInArea = (body[-1]['time'] - body[0]['time'])
      for index, frame in enumerate(body):
        if frame['Engaged'] == 'Yes':
          # get the duration of the Frame
          # if it is the last Frame of the record --> take the average value (usually around 0.032s)
          # else take the real duration of the Frame
          timedelta = (timeInArea / len(body)) if index == (len(body) - 1) \
            else (body[index + 1]['time'] - frame['time'])
          engagedFrames += timedelta.total_seconds()
      if len(body) > 1:
        if filterConfig['engagementFrom'] < (engagedFrames / timeInArea.total_seconds()) < filterConfig['engagementTo']:
          returnRecord.extend(body)
  return returnRecord


def filterAttributes(record):
  """
  Used for filter the record for attributes.
  :param: record: Dict[] --> record that should be filtered for attributes.
  :return: record: Dict[] --> filteredRecord that just contains frames with the selected attributes
  If a Frame doesnt fit on the filter['DisplayAttributes'] value, it will be thrown out of the record
  """
  # if filter allows all possible values, there is no need to check
  if filterConfig['DisplayAttributes'] == [-1, -1, -1]:
    return record
  returnRecord = []
  # check the frame
  for frame in record:
    filterGlasses = filterConfig['DisplayAttributes'][0]
    filterHappy = filterConfig['DisplayAttributes'][1]
    filterMouthMoved = filterConfig['DisplayAttributes'][2]
    filterGlassesErfuellt = (filterGlasses == -1 or (filterGlasses == 1 and frame['Glasses'] == 'Yes') or (
      filterGlasses == 0 and frame['Glasses'] == 'No'))
    filterHappyErfuellt = (filterHappy == -1 or (filterHappy == 1 and frame['Happy'] == 'Yes') or (
      filterHappy == 0 and frame['Happy'] == 'No'))
    filterMouthMovedErfuellt = (filterMouthMoved == -1 or (filterMouthMoved == 1 and frame['MouthMoved'] == 'Yes') or (
      filterMouthMoved == 1 and frame['MouthMoved'] == 'No'))
    if filterHappyErfuellt and filterMouthMovedErfuellt and filterGlassesErfuellt:
      returnRecord.append(frame)
  return returnRecord


def filterGroups(record):
  """
  method is for filtering the record in groups. Currently there are 2 groups, interactive and not interactive.
  if the filter is -1 return all groups
  it the filter is 0 return all bodies that interacted with the display
  if the filter is 1 return all bodies that didn't interact with the display
  :param record: unfiltered record with all groups
  :return: filtered record
  """
  if filterConfig['DisplayGroups'] == -1:
    return record
  elif filterConfig['DisplayGroups'] == 0:
    return filterGroupsInteractive(record)
  else:
    return filterGroupsNotInteractive(record)


def filterGroupsInteractive(record):
  """
  This method filters a record for interactive users
  :param record: unfiltered record
  :return: a record that only contains users who interacted with the ambient display
  """
  framesDividedInBodies = divideRecordInBodies(record)
  filteredRecord = []
  for body in framesDividedInBodies:
    if len(body) > 0:
      if checkTimeInArea(body, 2, True):
        engagementCounter = 0
        for frame in body:
          if engagementCounter == 2:
            filteredRecord.extend(body)
            break
          elif frame['Engaged'] == 'Yes':
            engagementCounter += 1
  return filteredRecord


def filterGroupsNotInteractive(record):
  """
  This method filters a record for not interactive users
  :param record: unfiltered record
  :return: a record that only contains users who didn't interact with the ambient display
  """
  framesDividedInBodies = divideRecordInBodies(record)
  filteredRecord = []
  for body in framesDividedInBodies:
    if len(body) > 0:
      if checkTimeInArea(body, 2, False):
        filteredRecord.extend(body)
      else:
        engagementCounter = 0
        for frame in body:
          if frame['Engaged'] == 'Yes':
            engagementCounter += 1
        if engagementCounter < 2:
          filteredRecord.extend(body)
  return filteredRecord


def checkTimeInArea(bodiesRecord, timeInArea, biggerThan):
  """
  This method checks if the bodies stay was longer or shorter than allowed
  :param bodiesRecord: Record of one body to check
  :param timeInArea: minimal/malximal amount of seconds
  :param biggerThan: boolean for deciding if the stay should be more than timeInArea (True) or less (False)
  :return: True if the condition is fulfilled
  """
  enteredAt = min(bodiesRecord, key=lambda x: x['time'])['time']
  leftAt = max(bodiesRecord, key=lambda x: x['time'])['time']
  if biggerThan:
    return (leftAt - enteredAt).total_seconds() >= timeInArea
  else:
    return (leftAt - enteredAt).total_seconds() <= timeInArea


def filterBodyAmount(record):
  """
  This method filters the record for the Body-Amount
  All frames that contain more ore less bodies than allowed are thrown out of the record
  :param record: unfiltered Record
  :return: record of frames that just contain the allowed amount of bodies
  """
  if filterConfig['minBodyAmount'] == 0 and filterConfig['maxBodyAmount'] == 6:
    return record
  else:
    returnRecord = []
    for frame in record:
      if filterConfig['minBodyAmount'] <= frame['bodyAmount'] <= filterConfig['maxBodyAmount']:
        returnRecord.append(frame)
    return returnRecord


def filterDistance(record):
  """
  This method filters the record for the distance
  All frames with a distance more than the allowed value were thrown out of the record
  :param record: unfiltered Record
  :return: filtered Record
  """
  if filterConfig['minDistance'] == 0 and filterConfig['maxDistance'] == -1:
    return record
  returnRecord = []
  for frame in record:
    if filterConfig['minDistance'] == 0 or frame['Distance'] > filterConfig['minDistance']:
      if filterConfig['maxDistance'] == -1 or frame['Distance'] < filterConfig['maxDistance']:
        returnRecord.append(frame)
  return returnRecord


def getFramesInArea(body, radius):
  isInArea = False
  recordPartsInArea = []
  for frame in body:
    if frame['Distance'] < radius and not isInArea:
      recordPartsInArea.append([frame])
      isInArea = True
    elif frame['Distance'] < radius and isInArea:
      recordPartsInArea[-1].append(frame)
    else:
      isInArea = False
  return recordPartsInArea


def checkViewIntensity(bodiesRecord, minEngagement):
  sortedBR = sorted(bodiesRecord, key=lambda x: x['time'])
  recDuration = max(bodiesRecord, key=lambda x: x['time'])['time'] - min(bodiesRecord, key=lambda x: x['time'])['time']
  largestView = 0
  # i = 0
  for i, record in enumerate(sortedBR):
    if record['Engaged'] == 'Yes':
      engagementStart = record['time']
      i += 1
      while i < len(sortedBR):
        if sortedBR[i]['Engaged'] != 'Yes':
          engagementEnd = sortedBR[i]['time']
          if (engagementEnd - engagementStart).total_seconds() > largestView:
            largestView = (engagementEnd - engagementStart).total_seconds()
            break
        i += 1
  return (largestView / recDuration.total_seconds()) > minEngagement


def divideRecordInBodies(record):
  maxBodyIndex = max(record, key=lambda x: x['bodyIndex'])['bodyIndex']
  framesDividedInBodies = [[] for i in range(maxBodyIndex + 1)]
  for frame in record:
    framesDividedInBodies[frame['bodyIndex']].append(frame)
  return framesDividedInBodies
