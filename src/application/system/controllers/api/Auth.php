<?php

use Carbon\Carbon,
    Firebase\JWT\JWT,
    Chaos\Common\Exceptions\ValidateException;

/**
 * Class Auth
 * @author ntd1712
 *
 * @method array|string|null post($key = null, $xss_clean = null)
 * @property-read \CI_Session $session
 */
class Auth extends \Shared\Classes\Controller
{
    /** {@inheritdoc} */
    public function index_get()
    {
        show_404();
    }

    /**
     * The "login" action
     *
     * @throws  ValidateException
     */
    public function login_post()
    {
        // are we logging out, or doing something else?
        if (true === (bool)$this->post('logout'))
        {
            $this->logout_post();
            return;
        }

        // do some checks
        if (empty($this->post('email')) || false === filter_var($this->post('email'), FILTER_VALIDATE_EMAIL))
        {
            throw new ValidateException('Email is empty or invalid');
        }

        if (empty($this->post('password')))
        {
            throw new ValidateException('Password is empty');
        }

        /** @var \Account\Entities\User $entity */
        $entity = $this->getService('User')->getByEmail($this->post('email'));

        if (null === $entity || !password_verify($this->post('password'), $entity->getPassword()))
        {
            throw new ValidateException('Invalid credentials');
        }

        // prepare data
        $user = $entity->toSimpleArray();
        $user['Roles'] = $user['Permissions'] = [];

        if (0 !== count($roles = $entity->getRoles()))
        {   /** @var \Account\Entities\UserRole $userRole */
            foreach ($roles as $userRole)
            {
                $user['Roles'][strtolower($userRole->getRole()->getName())] = $userRole->getRole()->getId();

                if (0 !== count($permissions = $userRole->getRole()->getPermissions()))
                {   /** @var \Account\Entities\Permission $permission */
                    foreach ($permissions as $permission)
                    {
                        $user['Permissions'][strtolower($permission->getName())] = $permission->getId();
                    }
                }
            }
        }

        JWT::$leeway = 60;
        $token = JWT::encode([
            'iss' => $appKey = $this->getConfig()->get('app.key'),
            'sub' => $entity->getUuid() ?: $entity->getId(),
            'aud' => $appKey,
            'exp' => Carbon::now()->addSeconds($this->getConfig()->get('session.expires'))->timestamp,
            'nbf' => $timestamp = Carbon::now()->timestamp,
            'iat' => $timestamp,
            'jti' => sha1(sprintf('ci3ng.%s.%s', $appKey, $timestamp)),
            'context' => ['user' => $user]
        ], $appKey);

        // save into session
        $this->session->set_userdata('loggedName', $user['Name']);
        $this->session->set_userdata('loggedUser', $user);

        // bye!
        $this->set_response(compact('token'));
    }

    /**
     * The "logout" action
     * @todo
     */
    public function logout_post()
    {
        // try
        // {
        //     \JWTAuth::invalidate(\JWTAuth::getToken());
        // }
        // catch (JWTException $e) {}

        $this->session->unset_userdata(['loggedName', 'loggedUser']);
        $this->set_response(['success' => true]);
    }

    /**
     * The "renewtoken" action
     * @todo
     */
    public function renewtoken_post()
    {
    }
}