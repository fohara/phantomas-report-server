# Dockerfile to serve reports generated by grunt-phantomas
#
# https://github.com/fohara/phantomas-report-server

FROM     tutum/ubuntu-trusty
MAINTAINER Frank O'Hara "frankj.ohara@gmail.com"

# Install node.js
RUN apt-get -y dist-upgrade
RUN apt-get -y install python-software-properties
RUN apt-get -y install software-properties-common
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get -y install nodejs

# Install rsync
RUN apt-get -y install rsync

# Create and set the working directory.
RUN mkdir /phantomas-report-server
WORKDIR /phantomas-report-server

# Copy source and utility files.
ADD entrypoint.sh /entrypoint.sh
ADD src/ /phantomas-report-server

# Install server dependencies.
RUN npm install -g forever
RUN npm install

# Expose ports
EXPOSE 3000

# Start services
RUN chmod +x /*.sh
CMD /entrypoint.sh
