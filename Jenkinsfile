#!groovy

def PIPELINE_PARAMETERS = '''
DESIRED_NODE_NAME = 'docker'
GIT_CREDENTIALS_ID = 'github'
PIPELINE_VERSION = 'v2.0.38'
PROJECT_NAME = 'raml-parser-service-e2e-test'
PLATFORM = 'node'
TEST_TIMEOUT = '5'
PRODUCT_NAME = 'api-manager'
COMPONENT_NAME = 'raml-parser-service-e2e-test'
environments {
    pull_request {
        ENVS = 'stg'
    }
    qa {
        ENVS = 'qa'
    }
    stg {
        ENVS = 'stg'
    }
    prod {
        ENVS = 'prod'
    }
}

'''

def final PIPELINE_ENV = 'PIPELINE_ENV'
def final DEFAULT_PIPELINE_ENV = 'pull_request'
def final PIPELINE_ENVS = 'pull_request,qa,stg,prod'

def pipelineProperties = [
    parameters([
        choice(
            name: 'PIPELINE_ENV',
            description: 'Environment where the test will be executed',
            choices: PIPELINE_ENVS.split(',').join('\n')
        )
    ])
]

def pipelineEnv = env[PIPELINE_ENV] ?: DEFAULT_PIPELINE_ENV,
    config = new ConfigSlurper(pipelineEnv).parse(PIPELINE_PARAMETERS).toProperties()

node(config.DESIRED_NODE_NAME) {
    withCredentials([
        [$class: 'UsernamePasswordMultiBinding', credentialsId: config.GIT_CREDENTIALS_ID, passwordVariable: 'GITHUB_PASS', usernameVariable: 'GITHUB_USER'],
        [$class: 'UsernamePasswordMultiBinding', credentialsId: 'credentials', passwordVariable: 'DEFAULT_PASSWORD'],
        [$class: 'UsernamePasswordMultiBinding', credentialsId: 'muleteer-bucket-key', passwordVariable: 'S3_SECRET_ACCESS_KEY', usernameVariable: 'S3_ACCESS_KEY_ID']
    ]) {
        checkout(
            scm: [
                $class           : 'GitSCM',
                userRemoteConfigs: [[credentialsId: config.GIT_CREDENTIALS_ID, url: 'git@github.com:mulesoft/automation-jenkins-pipeline.git']],
                branches         : [[name: config.PIPELINE_VERSION]]
            ],
            changelog: false,
            poll: false
        )

        load('pipeline.groovy').execute(config, pipelineEnv, PIPELINE_ENVS, pipelineProperties)
    }
}
