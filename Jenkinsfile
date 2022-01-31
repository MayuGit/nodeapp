pipeline{
     environment {
        registry = "mayupdocker/ndoeapp"
        registryCredential = 'dockerhub'
        dockerImage = ''
    }
    agent{label 'master'}
     
    tools{maven 'Maven3'}
    
    stages{
        stage('App Checkout'){
            steps{
                git branch: 'main', url: 'https://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@github.com/MayuGit/nodeapp.git'
            }
        }
        
        stage('Building Docker image') {
            steps{
                script {
                    dockerImage = docker.build registry + ":$BUILD_NUMBER"
                }
            }
        }
        stage('Upload Image to DockerHUB') {
            steps {    
                script {
                    docker.withRegistry( '', registryCredential ) {
                    dockerImage.push()
                    }
                }
            }
        }
         
        stage('ansible stages ahead') {
            steps {
                script{                    
                     echo 'Ansible stages ahead!'
                }
                //ansiblePlaybook credentialsId: 'sshvagrant5', extras: "-e tag=23", installation: 'myansible', playbook: '/var/jenkins_home/playbooks/VagrantCreate.yml'
            }
        }
         
        stage('Check if image exist and cleanup') {
           steps {
               //script{
               //    sh 'cp /var/jenkins_home/playbooks/dockercheck.yml ${WORKSPACE}/dockercheck.yml'
               //}
                ansiblePlaybook credentialsId: 'sshvagrant5', installation: 'myansible', playbook: 'dockercheck_nodeapp.yml'
           }
        }
         
        stage('Deploy image on client') {
           steps {
               //script{
               //    sh 'cp /var/jenkins_home/playbooks/dockerlogin.yml ${WORKSPACE}/dockerlogin.yml'
               //}
                //ansiblePlaybook credentialsId: 'sshvagrant5', extras: 'tag=${BUILD_NUMBER}', installation: 'myansible', playbook: '/var/jenkins_home/playbooks/dockerlogin.yml'
                ansiblePlaybook credentialsId: 'sshvagrant5', extras: "-e tag=${BUILD_NUMBER}", installation: 'myansible', playbook: 'dockerlogin_nodeapp.yml'
           }
        }
         
        
    }
    
}
