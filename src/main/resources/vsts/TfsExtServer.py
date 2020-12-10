#
# Copyright 2020 XEBIALABS
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#

import sys
import string
import com.xhaus.jyson.JysonCodec as json
from vsts.HttpRequest import HttpRequest
from vsts.util import error
from vsts import TfsServer

class TfsExtServer(TfsServer):
    def getBuilds(self, teamProjectName, buildDefinitionId, count):
        if not teamProjectName:
            raise Exception("Team project name is a mandatory field.")

        if not buildDefinitionId:
            raise Exception("Build Definition Id is a mandatory field.")

        response = self.request.get('%s/_apis/build/builds?api-version=2.0&definitions=%s&$top=%s' % (teamProjectName, buildDefinitionId, count))

        if response.status != 200:
            error("Error fetching builds list.", response)

        builds = json.loads(response.response)

        if builds["count"] == 0:
            error("No builds were found for definition %s " % buildDefinitionId)

        return builds

    def getWorkItemRaw(self, workItemId):
        if not workItemId:
            raise Exception("Work Item Id is a mandatory field.")

        response = self.request.get('_apis/wit/workitems/%s?api-version=1.0' % workItemId)

        if not response.isSuccessful():
            error("Error fetching work item.", response)

        return json.loads(response.response)