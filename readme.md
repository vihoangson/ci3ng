###################
# For UBUNTU users
###################

# Edit the hosts file: vi /etc/hosts
127.0.0.1   ci3ng.local

# Copy the .conf file
cp /var/www/html/ci3ng/deploys/20151217/local/ci3ng.local.conf /etc/apache2/sites-available/
a2ensite ci3ng.local.conf
service apache2 reload

####################
# For WINDOWS users
####################

# Add the following line to c:\Windows\System32\drivers\etc\hosts
127.0.0.1   ci3ng.local

# Add the following line to c:\wamp\bin\apache\apache2.4.9\conf\extra\httpd-vhosts.conf
IncludeOptional "c:/wamp/www/ci3ng/deploys/20151217/local/httpd-vhosts.conf"

# Restart WampServer

####################
# Installation
####################

# Create a new database named "ci3ng"
# cd to the "src" directory, run the command "composer install" in Terminal
# cd to the "src/public/themes/homer" directory, run the command "npm install"
# Login information: demo[@example.com] / @demo*