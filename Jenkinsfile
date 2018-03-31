try {
    timeout(time: 10, unit: 'MINUTES') {
       node('nodejs') {
           stage('build') {
             openshiftBuild(buildConfig: 'sxapi', showBuildLogs: 'true')
           }
           stage('deploy') {
             openshiftDeploy(deploymentConfig: 'sxapi')
           }
         }
    }
 } catch (err) {
    echo "in catch block"
    echo "Caught: ${err}"
    currentBuild.result = 'FAILURE'
    throw err
 }